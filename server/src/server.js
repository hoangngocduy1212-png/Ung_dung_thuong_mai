import app from './app.js';
import config from './config.js';
import { connectDB } from './db.js';
import { autoCompleteOrders } from './services/orderService.js';

await connectDB();
app.listen(config.port, () => console.log(`[server] http://localhost:${config.port}`));

// Mỗi giờ tự hoàn tất các đơn "Đã giao" quá hạn mà khách chưa xác nhận
setInterval(() => autoCompleteOrders().then((n) => n && console.log(`[job] tự hoàn tất ${n} đơn`)).catch(console.error), 3600000);
