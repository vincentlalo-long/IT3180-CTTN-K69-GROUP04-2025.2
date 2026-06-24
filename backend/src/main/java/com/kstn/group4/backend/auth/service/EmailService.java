package com.kstn.group4.backend.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String username, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("[MIXIFOOT] Yêu cầu khôi phục mật khẩu tài khoản");
            
            String htmlContent = buildResetPasswordHtml(username, resetUrl);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email khôi phục mật khẩu tới: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email khôi phục mật khẩu tới: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email xác nhận. Vui lòng thử lại sau.");
        }
    }

    private String buildResetPasswordHtml(String username, String resetUrl) {
        return "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\">" +
                "  <div style=\"background: linear-gradient(135deg, #005E2E 0%, #29721D 100%); padding: 32px 24px; text-align: center;\">" +
                "    <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px;\">MIXIFOOT</h1>" +
                "    <p style=\"color: #e2f8e5; margin: 8px 0 0 0; font-size: 14px;\">Hệ thống đặt sân bóng đá trực tuyến hàng đầu</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; background-color: #ffffff;\">" +
                "    <h3 style=\"color: #1e293b; margin-top: 0; font-size: 18px; font-weight: 700;\">Xin chào, " + username + "!</h3>" +
                "    <p style=\"color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;\">" +
                "      Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản MIXIFOOT của bạn. " +
                "      Vui lòng nhấn vào nút bấm dưới đây để thực hiện thiết lập lại mật khẩu mới:" +
                "    </p>" +
                "    <div style=\"text-align: center; margin: 32px 0;\">" +
                "      <a href=\"" + resetUrl + "\" style=\"background-color: #2E7D1E; color: #ffffff; text-decoration: none; padding: 14px 30px; font-weight: bold; border-radius: 12px; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(46, 125, 30, 0.2); transition: background-color 0.2s;\">" +
                "        Đặt lại mật khẩu" +
                "      </a>" +
                "    </div>" +
                "    <p style=\"color: #e11d48; font-size: 13px; font-weight: 600; margin-top: 24px;\">" +
                "      * Liên kết này chỉ có hiệu lực trong vòng 15 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ." +
                "    </p>" +
                "    <hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 32px 0 24px 0;\">" +
                "    <p style=\"color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;\">" +
                "      Nếu nút bấm trên không hoạt động, bạn cũng có thể sao chép liên kết dưới đây và dán vào trình duyệt:<br>" +
                "      <a href=\"" + resetUrl + "\" style=\"color: #3b82f6; text-decoration: underline;\">" + resetUrl + "</a>" +
                "    </p>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #f1f5f9;\">" +
                "    <p style=\"color: #64748b; font-size: 12px; margin: 0;\">© 2026 MIXIFOOT. All rights reserved.</p>" +
                "  </div>" +
                "</div>";
    }
}
