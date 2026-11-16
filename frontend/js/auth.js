import { h, $, $$, debounce } from "./utils.js";
import {
  forgotPassword, homeRedirectFor, isCustomer, listActiveShops, login, refreshProfile, registerCustomer, registerSeller, resetPassword, saveSession,
} from "./auth-service.js";
import { getToken, setFlash } from "./session.js";

const VIEWS = ["login", "register", "forgot", "reset"];
const CHANNELS = ["customer", "business", "staff"];
const PHONE_RE = /^(0|\+84)\d{9,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SECONDS = 60;

const ART = {
  customer: ["KẾT NỐI VỚI TECHSTORE", "Công nghệ đồng hành cùng bạn", "Khám phá thiết bị phù hợp và tận hưởng trải nghiệm mua sắm tiện lợi."],
  business: ["KÊNH DOANH NGHIỆP", "Đưa gian hàng của bạn lên sàn", "Quản lý sản phẩm, đơn hàng và khách hàng tại một nơi."],
  staff: ["NỘI BỘ TECHSTORE", "Khu vực dành cho CSKH và quản trị viên", "Đăng nhập bằng tài khoản được cấp để vào khu vực quản lý."],
};
const LOGIN_COPY = {
  customer: ["TÀI KHOẢN TECHSTORE", "Chào mừng trở lại", "Đăng nhập để khám phá thiết bị công nghệ và theo dõi đơn hàng của bạn."],
  business: ["KÊNH DOANH NGHIỆP", "Đăng nhập gian hàng", "Dành cho chủ gian hàng và nhân viên gian hàng."],
  staff: ["NỘI BỘ", "Đăng nhập CSKH / Quản trị", "Chỉ dành cho tài khoản CSKH và quản trị viên. Hai vai trò này không có đăng ký."],
};
const CHANNEL_LABEL = { customer: "Khách hàng", business: "Doanh nghiệp", staff: "CSKH / Quản trị viên" };

const state = { channel: "customer", view: "login", sellerType: null, resetToken: "", redirect: "", shops: [], shopsLoaded: false };

/* ------------------------------------------------------------------ */
/* Điều hướng giữa các view + đồng bộ URL                              */
/* ------------------------------------------------------------------ */
function parseUrl() {
  const p = new URLSearchParams(location.search);
  let channel = "customer";
  let view = "login";
  const tab = p.get("tab");
  if (CHANNELS.includes(tab)) channel = tab;
  else if (VIEWS.includes(tab)) view = tab;
  if (VIEWS.includes(p.get("view"))) view = p.get("view");
  const token = p.get("token") || "";
  if (token && !p.get("view")) view = "reset";
  return { channel, view, token, redirect: safeInternalRedirect(p.get("redirect")) };
}

function safeInternalRedirect(value) {
  if (!value) return "";
  try {
    const target = new URL(value, location.origin);
    if (target.origin !== location.origin || !target.pathname.startsWith("/") || target.pathname.startsWith("//")) return "";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "";
  }
}

function syncUrl(replace = false) {
  const p = new URLSearchParams();
  p.set("tab", state.channel);
  p.set("view", state.view);
  if (state.view === "reset" && state.resetToken) p.set("token", state.resetToken);
  if (state.redirect) p.set("redirect", state.redirect);
  const url = `${location.pathname}?${p}`;
  history[replace ? "replaceState" : "pushState"](null, "", url);
}

function show(view, { channel = state.channel, replace = false, focus = true } = {}) {
  // Kênh staff không có đăng ký; chỉ có đăng nhập
  if (channel === "staff" && view === "register") view = "login";
  state.view = view;
  state.channel = channel;
  render(focus);
  syncUrl(replace);
}

function render(focus = true) {
  document.body.dataset.role = state.channel;
  $$("[data-view]").forEach((s) => { s.hidden = s.dataset.view !== state.view; });

  const tabs = $("#channel-tabs");
  tabs.hidden = !["login", "register"].includes(state.view);
  $$("[data-channel]", tabs).forEach((b) => {
    const on = b.dataset.channel === state.channel;
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on || (state.channel === "staff" && b.dataset.channel === "customer") ? 0 : -1;
  });

  const [eyebrow, title, intro] = LOGIN_COPY[state.channel];
  $("#login-eyebrow").textContent = eyebrow;
  $("#login-title").textContent = title;
  $("#login-intro").textContent = intro;
  $("#login-switch").hidden = state.channel === "staff";
  $("#staff-entry").hidden = state.channel === "staff";
  $("#staff-exit").hidden = state.channel !== "staff";

  $$("[data-register]").forEach((d) => { d.hidden = d.dataset.register !== (state.channel === "business" ? "business" : "customer"); });
  if (state.view === "register" && state.channel === "business") showStep(state.sellerType ? "form" : "choose");

  const [aEyebrow, aTitle, aText] = ART[state.channel];
  $("#auth-art-eyebrow").textContent = aEyebrow;
  $("#auth-art-title").textContent = aTitle;
  $("#auth-art-description").textContent = aText;

  document.title = { login: "Đăng nhập", register: "Đăng ký", forgot: "Quên mật khẩu", reset: "Đặt lại mật khẩu" }[state.view] + " — TechStore";
  if (focus) {
    const section = $(`[data-view="${state.view}"]`);
    (section.querySelector("input:not([type=hidden]):not([type=checkbox])") || section.querySelector("button"))?.focus({ preventScroll: true });
  }
}

/* ------------------------------------------------------------------ */
/* Trợ giúp form                                                       */
/* ------------------------------------------------------------------ */
function fieldError(form, name, message) {
  const input = form.elements[name];
  const box = form.querySelector(`[data-error="${name}"]`);
  if (box) box.textContent = message || "";
  if (input && input.type !== "checkbox") input.setAttribute("aria-invalid", message ? "true" : "false");
}

function clearErrors(form) {
  $$("[data-error]", form).forEach((b) => { b.textContent = ""; });
  $$("[aria-invalid]", form).forEach((i) => i.setAttribute("aria-invalid", "false"));
  formError(form, "");
}

function formError(form, message) {
  const box = form.querySelector("[data-form-error]");
  if (box) box.textContent = message || "";
}

function focusFirstInvalid(form) {
  (form.querySelector('[aria-invalid="true"]') || form.querySelector("[data-error]:not(:empty)")?.closest(".auth-field")?.querySelector("input"))?.focus();
}

function setLoading(form, loading, label) {
  const btn = form.querySelector(".auth-submit");
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle("is-loading", loading);
  btn.setAttribute("aria-busy", String(loading));
  if (loading) {
    btn.dataset.label = btn.innerHTML;
    btn.textContent = label || "Đang xử lý...";
  } else if (btn.dataset.label && !btn.dataset.cooldown) {
    btn.innerHTML = btn.dataset.label;
  }
}

/** Gắn xử lý submit có chống bấm đúp. */
function bindForm(form, handler, loadingLabel) {
  let busy = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    clearErrors(form);
    busy = true;
    setLoading(form, true, loadingLabel);
    try {
      await handler(form);
    } finally {
      busy = false;
      setLoading(form, false);
    }
  });
  form.addEventListener("input", (event) => {
    const name = event.target.name;
    if (name && form.querySelector(`[data-error="${name}"]`)?.textContent) fieldError(form, name, "");
  });
}

function mapServerFieldErrors(form, error) {
  const issues = Array.isArray(error.details) ? error.details : error.details?.issues;
  if (!Array.isArray(issues)) return false;
  let mapped = false;
  issues.forEach((issue) => {
    const key = Array.isArray(issue.path) ? issue.path[0] : issue.path;
    if (key && form.elements[key]) {
      fieldError(form, key, issue.message || error.message);
      mapped = true;
    }
  });
  return mapped;
}

/* ------------------------------------------------------------------ */
/* Validation phía client (khớp ràng buộc của backend)                  */
/* ------------------------------------------------------------------ */
const v = {
  email(val) {
    if (!val) return "Vui lòng nhập email";
    return EMAIL_RE.test(val) ? "" : "Email không đúng định dạng";
  },
  name(val) {
    if (!val) return "Vui lòng nhập họ và tên";
    return val.length < 2 || val.length > 80 ? "Họ và tên từ 2 đến 80 ký tự" : "";
  },
  phone(val) {
    if (!val) return "Vui lòng nhập số điện thoại";
    return PHONE_RE.test(val.replace(/[\s.-]/g, "")) ? "" : "Số điện thoại không hợp lệ (ví dụ 0912345678)";
  },
  password(val) {
    if (!val) return "Vui lòng nhập mật khẩu";
    return val.length < 6 ? "Mật khẩu tối thiểu 6 ký tự" : "";
  },
  confirm(val, pw) {
    if (!val) return "Vui lòng nhập lại mật khẩu";
    return val !== pw ? "Mật khẩu nhập lại không khớp" : "";
  },
};

function check(form, rules) {
  let ok = true;
  for (const [name, message] of Object.entries(rules)) {
    fieldError(form, name, message);
    if (message) ok = false;
  }
  if (!ok) focusFirstInvalid(form);
  return ok;
}

function passwordStrength(pw) {
  if (!pw) return { level: 0, label: "chưa nhập" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += pw.length >= 8 ? 1 : 0;
  const level = Math.max(1, Math.min(4, score));
  return { level, label: ["", "yếu", "trung bình", "khá", "mạnh"][level] };
}

function bindStrength(input) {
  const meter = $(`#${input.id.replace(/-(password)$/, "")}-strength`) || input.closest(".auth-field").querySelector("[data-strength]");
  input.addEventListener("input", () => {
    const { level, label } = passwordStrength(input.value);
    meter.dataset.level = String(level);
    meter.querySelector("small").textContent = `Độ mạnh mật khẩu: ${label}`;
  });
}

/* ------------------------------------------------------------------ */
/* Đăng nhập                                                           */
/* ------------------------------------------------------------------ */
const SHOP_BLOCK = {
  pending: "Gian hàng của bạn đang chờ quản trị viên duyệt. Vui lòng đăng nhập lại sau khi được duyệt.",
  locked: "Gian hàng đã bị khóa. Vui lòng liên hệ quản trị viên.",
  rejected: "Gian hàng đã bị từ chối. Vui lòng liên hệ quản trị viên.",
};

function channelMismatch(role, channel) {
  const belongs = { customer: role === "customer", business: role === "seller", staff: role === "cskh" || role === "admin" }[channel];
  if (belongs) return "";
  const own = role === "customer" ? "customer" : role === "seller" ? "business" : "staff";
  const hint = own === "staff" ? "Vui lòng dùng lối vào “Dành cho CSKH / Quản trị viên”." : `Vui lòng chuyển sang tab ${CHANNEL_LABEL[own]}.`;
  return `Tài khoản này không thuộc kênh ${CHANNEL_LABEL[channel]}. ${hint}`;
}

async function onLogin(form) {
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  if (!check(form, { email: v.email(email), password: password ? "" : "Vui lòng nhập mật khẩu" })) return;

  try {
    const data = await login(email, password);
    const { token, user, shop } = data;

    const mismatch = channelMismatch(user.role, state.channel);
    if (mismatch) return formError(form, mismatch);
    if (user.role === "seller" && shop && SHOP_BLOCK[shop.status]) return formError(form, SHOP_BLOCK[shop.status]);

    saveSession({ token, user }, form.elements.remember.checked);
    if (!isCustomer(user) && user.role !== "cskh") setFlash("Tính năng đang phát triển");
    location.replace(isCustomer(user) && state.redirect ? state.redirect : homeRedirectFor(user));
    await new Promise(() => {}); // giữ trạng thái loading trong lúc chuyển trang
  } catch (error) {
    if (error.status === 401 || error.status === 403) formError(form, error.message);
    else if (!mapServerFieldErrors(form, error)) formError(form, error.message);
  }
}

/* ------------------------------------------------------------------ */
/* Đăng ký khách hàng                                                  */
/* ------------------------------------------------------------------ */
function commonAccountRules(form) {
  const f = form.elements;
  return {
    fullName: v.name(f.fullName.value.trim()),
    email: v.email(f.email.value.trim()),
    phone: v.phone(f.phone.value.trim()),
    password: v.password(f.password.value),
    confirmPassword: v.confirm(f.confirmPassword.value, f.password.value),
  };
}

function accountPayload(form) {
  const f = form.elements;
  return {
    fullName: f.fullName.value.trim(),
    email: f.email.value.trim(),
    phone: f.phone.value.replace(/[\s.-]/g, ""),
    password: f.password.value,
  };
}

function handleRegisterError(form, error) {
  if (error.status === 409 && /gian hàng/i.test(error.message) && form.elements.shopName) {
    fieldError(form, "shopName", "Tên gian hàng này đã có chủ. Vui lòng chọn tên khác.");
    form.elements.shopName.focus();
  } else if (error.status === 409 && /email/i.test(error.message)) {
    fieldError(form, "email", error.message);
    form.elements.email.focus();
  } else if (error.status === 404 && form.elements.shopId) {
    fieldError(form, "shopId", error.message);
    state.shopsLoaded = false;
    loadShops();
  } else if (!mapServerFieldErrors(form, error)) {
    formError(form, error.message);
  }
}

async function onRegisterCustomer(form) {
  const rules = { ...commonAccountRules(form), terms: form.elements.terms.checked ? "" : "Bạn cần đồng ý với điều khoản để tiếp tục" };
  if (!check(form, rules)) return;
  try {
    const { token, user } = await registerCustomer(accountPayload(form));
    saveSession({ token, user }, false);
    location.replace(state.redirect || "./index.html");
    await new Promise(() => {});
  } catch (error) {
    handleRegisterError(form, error);
  }
}

/* ------------------------------------------------------------------ */
/* Đăng ký doanh nghiệp                                                */
/* ------------------------------------------------------------------ */
function showStep(step) {
  $$("[data-step]").forEach((s) => { s.hidden = s.dataset.step !== step; });
  if (step.startsWith("done")) $(`[data-step="${step}"]`).focus();
}

function chooseSellerType(type) {
  state.sellerType = type;
  const form = $("#seller-form");
  const owner = type === "owner";
  form.reset();
  clearErrors(form);
  form.querySelector("[data-owner-only]").hidden = !owner;
  form.querySelector("[data-staff-only]").hidden = owner;
  $("#seller-form-intro").textContent = owner
    ? "Tạo tài khoản chủ doanh nghiệp và đăng ký gian hàng của bạn."
    : "Tạo tài khoản nhân viên và chọn gian hàng bạn muốn tham gia.";
  $("#seller-note").textContent = owner
    ? "Gian hàng mới sẽ chờ quản trị viên phê duyệt. Mỗi gian hàng chỉ có một chủ."
    : "Yêu cầu tham gia cần được chủ gian hàng phê duyệt trước khi bạn đăng nhập. Mỗi gian hàng có thể có nhiều nhân viên.";
  showStep("form");
  if (!owner) loadShops();
  $("#sel-name").focus();
}

async function onRegisterSeller(form) {
  const f = form.elements;
  const owner = state.sellerType === "owner";
  const rules = { ...commonAccountRules(form), terms: f.terms.checked ? "" : "Bạn cần đồng ý với điều khoản để tiếp tục" };
  if (owner) {
    const shopName = f.shopName.value.trim();
    rules.shopName = !shopName ? "Vui lòng nhập tên gian hàng" : shopName.length < 2 || shopName.length > 80 ? "Tên gian hàng từ 2 đến 80 ký tự" : "";
  } else {
    rules.shopId = f.shopId.value ? "" : "Vui lòng chọn gian hàng bạn muốn tham gia";
  }
  if (!check(form, rules)) return;

  const body = { ...accountPayload(form), sellerType: state.sellerType };
  if (owner) body.shopName = f.shopName.value.trim();
  else body.shopId = f.shopId.value;

  try {
    await registerSeller(body);
    showStep(owner ? "done-owner" : "done-staff");
    form.reset();
  } catch (error) {
    handleRegisterError(form, error);
  }
}

/* Hộp chọn gian hàng có tìm kiếm */
async function loadShops() {
  const list = $("#sel-shop-list");
  if (state.shopsLoaded) return;
  list.replaceChildren(h("div", { class: "combo__empty", text: "Đang tải danh sách gian hàng..." }));
  try {
    state.shops = await listActiveShops();
    state.shopsLoaded = true;
    renderShopOptions();
  } catch (error) {
    list.replaceChildren(
      h("div", { class: "combo__empty" }, error.message, " ",
        h("button", { type: "button", class: "auth-text-button", style: "color:#1267d5", onclick: loadShops }, "Thử lại")));
  }
}

function renderShopOptions() {
  const input = $("#sel-shop-search");
  const list = $("#sel-shop-list");
  const q = input.value.trim().toLowerCase();
  const matches = state.shops.filter((s) => s.name.toLowerCase().includes(q));
  list.replaceChildren(...(matches.length
    ? matches.map((s) => h("button", {
        type: "button", role: "option", class: "combo__option", "aria-selected": "false", onclick: () => pickShop(s),
      }, s.name))
    : [h("div", { class: "combo__empty", text: state.shops.length ? "Không tìm thấy gian hàng phù hợp" : "Hiện chưa có gian hàng nào đang hoạt động" })]));
}

function pickShop(shop) {
  const form = $("#seller-form");
  form.elements.shopId.value = shop._id;
  $("#sel-shop-search").value = shop.name;
  closeCombo();
  fieldError(form, "shopId", "");
}

function openCombo() {
  $("#sel-shop-list").hidden = false;
  $("#sel-shop-search").setAttribute("aria-expanded", "true");
}

function closeCombo() {
  $("#sel-shop-list").hidden = true;
  $("#sel-shop-search").setAttribute("aria-expanded", "false");
}

function setupCombo() {
  const input = $("#sel-shop-search");
  input.addEventListener("focus", () => { loadShops(); openCombo(); });
  input.addEventListener("input", () => {
    $("#seller-form").elements.shopId.value = ""; // phải chọn lại từ danh sách
    renderShopOptions();
    openCombo();
  });
  input.addEventListener("keydown", (e) => {
    const options = $$(".combo__option");
    if (e.key === "Escape") closeCombo();
    else if (e.key === "ArrowDown" && options.length) { e.preventDefault(); openCombo(); options[0].focus(); }
    else if (e.key === "Enter" && !$("#sel-shop-list").hidden && options.length === 1) { e.preventDefault(); options[0].click(); }
  });
  $("#sel-shop-list").addEventListener("keydown", (e) => {
    const options = $$(".combo__option");
    const i = options.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); options[Math.min(i + 1, options.length - 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (i <= 0 ? input : options[i - 1]).focus(); }
    else if (e.key === "Escape") { closeCombo(); input.focus(); }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".combo")) closeCombo(); });
}

/* ------------------------------------------------------------------ */
/* Quên / đặt lại mật khẩu                                             */
/* ------------------------------------------------------------------ */
let resendTimer;

function startCountdown() {
  const btn = $("#forgot-submit");
  let left = RESEND_SECONDS;
  clearInterval(resendTimer);
  const label = "Gửi hướng dẫn đặt lại";
  const tick = () => {
    if (left <= 0) {
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.dataset.cooldown = "";
      btn.innerHTML = `${label} <span aria-hidden="true">→</span>`;
      return;
    }
    btn.disabled = true;
    btn.dataset.cooldown = "1";
    btn.textContent = `Gửi lại sau ${left}s`;
    left -= 1;
  };
  tick();
  resendTimer = setInterval(tick, 1000);
}

async function onForgot(form) {
  if (form.querySelector("#forgot-submit").dataset.cooldown) return;
  const email = form.elements.email.value.trim();
  if (!check(form, { email: v.email(email) })) return;
  $("#forgot-ok").textContent = "";
  $("#dev-token").hidden = true;
  try {
    const data = await forgotPassword(email);
    // Thông báo trung tính: không cho biết email có tồn tại hay không
    $("#forgot-ok").textContent = data?.message || "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi tới bạn.";
    if (data?.devResetToken) showDevToken(data.devResetToken);
    startCountdown();
  } catch (error) {
    formError(form, error.message);
  }
}

// Backend chưa có dịch vụ email: ở môi trường dev, token đặt lại được trả trong phản hồi.
function showDevToken(token) {
  const link = `${location.pathname}?tab=customer&view=reset&token=${encodeURIComponent(token)}`;
  $("#dev-token").replaceChildren(
    h("strong", { text: "Môi trường phát triển (chưa có dịch vụ email)" }),
    h("span", { text: "Dùng liên kết sau để đặt lại mật khẩu (hiệu lực 15 phút):" }),
    h("a", { href: link, text: "Mở trang đặt lại mật khẩu" }),
    h("span", { text: `Mã: ${token}` }),
  );
  $("#dev-token").hidden = false;
}

async function onReset(form) {
  const pw = form.elements.password.value;
  if (!state.resetToken) return formError(form, "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.");
  if (!check(form, { password: v.password(pw), confirmPassword: v.confirm(form.elements.confirmPassword.value, pw) })) return;
  try {
    await resetPassword(state.resetToken, pw);
    state.resetToken = "";
    form.reset();
    show("login", { channel: "customer" });
    showLoginNotice("Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.");
  } catch (error) {
    formError(form, error.message);
  }
}

function showLoginNotice(message) {
  const box = $("#login-form [data-form-error]");
  box.textContent = message;
  box.classList.add("auth-alert--ok");
  box.setAttribute("role", "status");
  const clear = () => {
    box.classList.remove("auth-alert--ok");
    box.setAttribute("role", "alert");
    $("#login-form").removeEventListener("input", clear);
  };
  $("#login-form").addEventListener("input", clear);
}

/* ------------------------------------------------------------------ */
/* Khởi tạo                                                            */
/* ------------------------------------------------------------------ */
function setupGeneral() {
  document.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    if (go) {
      const view = go.dataset.go;
      if (view === "register" || view === "login") {
        if (state.view === "register" && view === "login") state.sellerType = null;
      }
      show(view, { channel: state.channel === "staff" && view !== "login" ? "customer" : state.channel });
      return;
    }
    const toggle = event.target.closest("[data-password-toggle]");
    if (toggle) {
      const input = $(`#${toggle.dataset.passwordToggle}`);
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      toggle.textContent = reveal ? "Ẩn" : "Hiện";
      toggle.setAttribute("aria-label", reveal ? "Ẩn mật khẩu" : "Hiện mật khẩu");
    }
  });

  const tabs = $("#channel-tabs");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-channel]");
    if (!btn) return;
    if (btn.dataset.channel !== state.channel) {
      state.sellerType = null;
      $$(".auth-form [data-form-error]").forEach((b) => { b.textContent = ""; });
      show(state.view, { channel: btn.dataset.channel });
    }
  });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = state.channel === "customer" ? "business" : "customer";
    show(state.view, { channel: next, focus: false });
    $(`#tab-${next}`).focus();
  });

  $("#staff-entry").addEventListener("click", () => show("login", { channel: "staff" }));
  $("#staff-exit").addEventListener("click", () => show("login", { channel: "customer" }));
  $("#seller-back").addEventListener("click", () => { state.sellerType = null; showStep("choose"); });
  $$("[data-seller-type]").forEach((b) => b.addEventListener("click", () => chooseSellerType(b.dataset.sellerType)));

  $$("input[name=password]").forEach((i) => { if (i.closest("#register-form, #seller-form, #reset-form")) bindStrength(i); });
  setupCombo();

  window.addEventListener("popstate", () => {
    const { channel, view, token, redirect } = parseUrl();
    state.resetToken = token;
    state.redirect = redirect;
    state.view = view;
    state.channel = channel;
    render(false);
  });
}

async function init() {
  const parsed = parseUrl();
  state.redirect = parsed.redirect;
  if (getToken()) {
    const user = await refreshProfile();
    if (user) {
      if (!isCustomer(user) && user.role !== "cskh") setFlash("Tính năng đang phát triển");
      location.replace(isCustomer(user) && state.redirect ? state.redirect : homeRedirectFor(user));
      return;
    }
  }

  setupGeneral();
  bindForm($("#login-form"), onLogin, "Đang đăng nhập...");
  bindForm($("#register-form"), onRegisterCustomer, "Đang tạo tài khoản...");
  bindForm($("#seller-form"), onRegisterSeller, "Đang gửi đăng ký...");
  bindForm($("#forgot-form"), onForgot, "Đang gửi...");
  bindForm($("#reset-form"), onReset, "Đang cập nhật...");

  const { channel, view, token, redirect } = parsed;
  state.resetToken = token;
  state.redirect = redirect;
  show(view, { channel, replace: true, focus: false });
}

init();
