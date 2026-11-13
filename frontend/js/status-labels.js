export const ORDER_STATUS_LABELS = {
  cho_xac_nhan: "Chờ xác nhận",
  da_xac_nhan: "Đã xác nhận",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
  hoan_tat: "Hoàn tất",
  da_huy: "Đã hủy",
  da_tra_hang: "Đã trả hàng",
};

export const AFTER_SALES_TYPE_LABELS = {
  huy_don: "Yêu cầu hủy",
  hoan_tien: "Yêu cầu hoàn tiền",
  doi_hang: "Yêu cầu đổi hàng",
};

export const AFTER_SALES_STATUS_LABELS = {
  cho_xu_ly: "Chờ xử lý",
  da_chap_nhan: "Được chấp nhận",
  bi_tu_choi: "Bị từ chối",
};

export const COMPLAINT_STATUS_LABELS = {
  moi: "Mới",
  dang_xu_ly: "Đang xử lý",
  chuyen_admin: "Đã chuyển cấp trên",
  da_xu_ly: "Đã xử lý",
};

export const VOUCHER_STATUS_LABELS = {
  unused: "Chưa dùng",
  used: "Đã dùng",
  expired: "Hết hạn",
};

export const POINT_TYPE_LABELS = {
  earn: "Cộng điểm",
  redeem: "Đổi voucher",
  revoke: "Thu hồi điểm",
};

export const statusClass = (status) => `status status--${status || "unknown"}`;