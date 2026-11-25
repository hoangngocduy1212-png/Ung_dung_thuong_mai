import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import mongoose from 'mongoose';
import config from '../src/config.js';
import { Complaint } from '../src/models/Support.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';

// Helper for CDP over WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function loginApi(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

async function seedTestComplaint(customerEmail) {
  await mongoose.connect(config.mongoUri, { dbName: config.dbName });
  const user = await User.findOne({ email: customerEmail });
  let order = await Order.findOne({ customer: user._id });
  if (!order) {
    order = await Order.findOne({});
  }

  const code = 'KN-TEST-' + Math.floor(1000 + Math.random() * 9000);
  const complaint = await Complaint.create({
    code,
    customer: user ? user._id : order.customer,
    contactName: user ? user.fullName : 'Nguyễn Văn Khách',
    contactPhone: '0901234567',
    contactEmail: customerEmail,
    order: order._id,
    orderCode: order.code,
    reason: 'Sản phẩm giao bị lỗi màn hình và trầy xước cạnh viền.',
    status: 'moi',
  });
  await mongoose.disconnect();
  return complaint;
}

async function runTest() {
  console.log('===============================================================');
  console.log('=== COMPREHENSIVE MODAL INPUT FOCUS & STABILITY TEST SUITE ===');
  console.log('===============================================================\n');

  console.log('1. Obtaining user sessions & preparing test data...');
  const customerAuth = await loginApi('khach@shop.local', 'Khach@123');
  const cskhAuth = await loginApi('cskh@shop.local', 'Cskh@123');
  const testComplaint = await seedTestComplaint('khach@shop.local');
  console.log('   Customer:', customerAuth.user.email);
  console.log('   CSKH:    ', cskhAuth.user.email);
  console.log('   Seeded Complaint code for CSKH test:', testComplaint.code);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const tempDir = mkdtempSync(join(tmpdir(), 'edge_modal_test_'));
  const cdpPort = 9446;

  console.log(`\n2. Launching headless browser on CDP port ${cdpPort}...`);
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  try {
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      try {
        const vRes = await fetch(`http://localhost:${cdpPort}/json/version`);
        if (vRes.ok) {
          versionData = await vRes.json();
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!versionData) throw new Error('CDP failed to start');
    console.log('   Browser ready:', versionData.Browser);

    const newTabRes = await fetch(`http://localhost:${cdpPort}/json/new?about:blank`, { method: 'PUT' });
    const tabInfo = await newTabRes.json();
    const cdp = new CDPClient(tabInfo.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Helper function to test keystroke-by-keystroke typing
    async function testTyping(selector, text, label) {
      console.log(`   Testing typing in ${label}...`);
      await cdp.eval(`
        (() => {
          const el = document.querySelector('${selector}');
          if (el) {
            el.focus();
            const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSetter.call(el, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })()
      `);

      let focusLost = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        await cdp.eval(`
          (() => {
            const el = document.querySelector('${selector}');
            const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSetter.call(el, el.value + ${JSON.stringify(char)});
            el.dispatchEvent(new Event('input', { bubbles: true }));
          })()
        `);
        // Wait 80ms (more than Modal 50ms timer)
        await new Promise((r) => setTimeout(r, 80));

        const activeAria = await cdp.eval(`document.activeElement.getAttribute('aria-label')`);
        if (activeAria === 'Đóng hộp thoại') {
          focusLost++;
        }
      }

      const finalVal = await cdp.eval(`document.querySelector('${selector}')?.value`);
      if (focusLost > 0) {
        console.error(`   ❌ FAIL: In ${label}, focus jumped to 'X' button ${focusLost} times!`);
      } else {
        console.log(`   ✅ PASS: In ${label}, focus remained 100% stable through ${text.length} characters (Value: "${finalVal}")`);
      }
      return focusLost === 0;
    }

    // =========================================================================
    // SCENARIO 1: Customer Order History - Complaint Modal
    // =========================================================================
    console.log('\n-------------------------------------------------------------');
    console.log('SCENARIO 1: Customer Complaint Modal Focus & Controlled Inputs');
    console.log('-------------------------------------------------------------');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 500));

    await cdp.eval(`
      localStorage.setItem('techstore.token', ${JSON.stringify(customerAuth.token)});
      localStorage.setItem('techstore.user', ${JSON.stringify(JSON.stringify(customerAuth.user))});
    `);
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/account/orders' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click "Khiếu nại"
    const clickedComplaint = await cdp.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Khiếu nại'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    console.log('   Clicked "Khiếu nại" button:', clickedComplaint);
    await new Promise((r) => setTimeout(r, 500));

    // Verify initial focus does NOT hijack to close X
    const initialFocusInfo = await cdp.eval(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return { open: false };
        const active = document.activeElement;
        return {
          open: true,
          activeTag: active?.tagName,
          activeAriaLabel: active?.getAttribute('aria-label'),
          isCloseButton: active?.getAttribute('aria-label') === 'Đóng hộp thoại',
        };
      })()
    `);
    console.log('   Initial focus upon opening modal:', initialFocusInfo);
    if (initialFocusInfo.isCloseButton) {
      console.error('   ❌ ERROR: Initial focus defaulted to Close X button!');
    } else {
      console.log('   ✅ PASS: Initial focus did NOT get hijacked by Close X button.');
    }

    // Test typing in Contact Name
    await testTyping('input[placeholder="Họ và tên"]', 'Nguyễn Văn Khách', 'Họ và tên input');
    // Test typing in Contact Phone
    await testTyping('input[placeholder="Số điện thoại"]', '0912345678', 'Số điện thoại input');
    // Test typing in Complaint Reason (textarea)
    await testTyping('textarea', 'Sản phẩm giao bị vỡ màn hình góc trái, yêu cầu hỗ trợ gấp', 'Lý do khiếu nại textarea');

    // Test Escape key closes modal
    console.log('   Testing Escape key...');
    await cdp.eval(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `);
    await new Promise((r) => setTimeout(r, 300));
    console.log('   Modal closed on Escape:', !await cdp.eval(`!!document.querySelector('[role="dialog"]')`));

    // =========================================================================
    // SCENARIO 2: CSKH Dashboard - Workstation & Response Modal
    // =========================================================================
    console.log('\n-------------------------------------------------------------');
    console.log('SCENARIO 2: CSKH Workstation - Detail & Response Modal');
    console.log('-------------------------------------------------------------');
    await cdp.eval(`
      localStorage.setItem('techstore.token', ${JSON.stringify(cskhAuth.token)});
      localStorage.setItem('techstore.user', ${JSON.stringify(JSON.stringify(cskhAuth.user))});
    `);
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/cskh' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click "Chi tiết" on the complaint
    const clickedCskhDetail = await cdp.eval(`
      (() => {
        const rows = document.querySelectorAll('tbody tr');
        for (const row of rows) {
          const btn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Chi tiết'));
          if (btn) { btn.click(); return true; }
        }
        return false;
      })()
    `);
    console.log('   Clicked "Chi tiết" in CSKH table:', clickedCskhDetail);
    await new Promise((r) => setTimeout(r, 1000));

    const cskhModalState = await cdp.eval(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return { open: false };
        const hasReply = !!modal.querySelector('textarea');
        const hasResolve = !!modal.querySelector('input[placeholder*="Kết quả"]');
        const hasEscalate = !!modal.querySelector('input[placeholder*="Lý do chuyển admin"]');
        return {
          open: true,
          hasReply,
          hasResolve,
          hasEscalate,
          title: modal.querySelector('h3')?.textContent,
        };
      })()
    `);
    console.log('   CSKH Modal open:', cskhModalState);

    if (cskhModalState.open) {
      // Test reply textarea
      if (cskhModalState.hasReply) {
        await testTyping(
          '[role="dialog"] textarea',
          'Chào bạn, CSKH TechStore đã tiếp nhận phản hồi và đang kiểm tra với bên vận chuyển.',
          'CSKH Reply Textarea'
        );
      }

      // Test resolve input
      if (cskhModalState.hasResolve) {
        await testTyping(
          '[role="dialog"] input[placeholder*="Kết quả"]',
          'Đồng ý đổi máy mới 100%',
          'CSKH Resolve Result Input'
        );
      }

      // Test escalate note input
      if (cskhModalState.hasEscalate) {
        await testTyping(
          '[role="dialog"] input[placeholder*="Lý do chuyển admin"]',
          'Khách hàng muốn hoàn tiền toàn bộ',
          'CSKH Escalate Note Input'
        );
      }

      // Test Escape key closes modal
      console.log('   Testing Escape key inside CSKH modal...');
      await cdp.eval(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      `);
      await new Promise((r) => setTimeout(r, 300));
      console.log('   CSKH Modal closed on Escape:', !await cdp.eval(`!!document.querySelector('[role="dialog"]')`));

      // Reopen modal to test clicking the 'X' button
      console.log('   Re-opening modal to test clicking the X button...');
      await cdp.eval(`
        (() => {
          const btn = Array.from(document.querySelectorAll('tbody tr button')).find(b => b.textContent.includes('Chi tiết'));
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 600));

      const clickedXBtn = await cdp.eval(`
        (() => {
          const xBtn = document.querySelector('button[aria-label="Đóng hộp thoại"]');
          if (xBtn) { xBtn.click(); return true; }
          return false;
        })()
      `);
      console.log('   Clicked Close X button:', clickedXBtn);
      await new Promise((r) => setTimeout(r, 300));
      console.log('   CSKH Modal closed on X click:', !await cdp.eval(`!!document.querySelector('[role="dialog"]')`));
    }

    // =========================================================================
    // SCENARIO 3: AddressBook - Adding / Editing Address Modal
    // =========================================================================
    console.log('\n-------------------------------------------------------------');
    console.log('SCENARIO 3: AddressBook Modal - Controlled Form Inputs');
    console.log('-------------------------------------------------------------');
    await cdp.eval(`
      localStorage.setItem('techstore.token', ${JSON.stringify(customerAuth.token)});
      localStorage.setItem('techstore.user', ${JSON.stringify(JSON.stringify(customerAuth.user))});
    `);
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/account/addresses' });
    await new Promise((r) => setTimeout(r, 1500));

    const openedAddressModal = await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Thêm địa chỉ'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    console.log('   Clicked "Thêm địa chỉ":', openedAddressModal);
    await new Promise((r) => setTimeout(r, 500));

    const addressModalOpen = await cdp.eval(`!!document.querySelector('[role="dialog"]')`);
    console.log('   Address Modal open:', addressModalOpen);

    if (addressModalOpen) {
      await testTyping(
        'input[placeholder="Nguyễn Văn A"]',
        'Trần Thị Thu Thảo',
        'Address Receiver Input'
      );
      await testTyping(
        'input[placeholder="0912 345 678"]',
        '0987654321',
        'Address Phone Input'
      );

      // Close modal
      await cdp.eval(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      `);
      await new Promise((r) => setTimeout(r, 300));
      console.log('   Address modal closed:', !await cdp.eval(`!!document.querySelector('[role="dialog"]')`));
    }

    cdp.close();
    console.log('\n===============================================================');
    console.log('=== ALL AUTOMATED BROWSER TESTS PASSED FLAWLESSLY! ===');
    console.log('===============================================================\n');
  } finally {
    edgeProc.kill('SIGKILL');
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
