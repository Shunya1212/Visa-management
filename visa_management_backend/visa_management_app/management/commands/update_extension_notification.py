from django.core.management.base import BaseCommand
from datetime import date, timedelta
from visa_management_app.models import StudentInfo
from django.core.mail import EmailMessage

class Command(BaseCommand):
    help = "Send email notifications for students whose visa expires in 30 days or report is due in 7 days"

    def handle(self, *args, **kwargs):
        # 今日から30日後の日付を計算
        target_date_visa = date.today() + timedelta(days=30)
        

        # 今日から7日後の日付を計算
        target_date_report = date.today() + timedelta(days=7)
        target_date_report_submittted = date.today() - timedelta(days=7)

        # visa_expire_date が target_date の学生を取得
        visa_students = StudentInfo.objects.filter(visa_expire_date=target_date_visa)
        visa_extended_students = StudentInfo.objects.filter(visa_expire_date=date.today())

        # report_90_days_date が target_date の学生を取得
        report_students = StudentInfo.objects.filter(report_90_days_date=target_date_report)
        report_submitted_students = StudentInfo.objects.filter(report_90_days_date=target_date_report_submittted)


        # 両方の学生リストを処理
        if not visa_students.exists() and not report_students.exists() and not visa_extended_students.exists() and not report_submitted_students.exists():
            self.stdout.write("No students found with visa expiring in 30 days or report due in 7 days.")
            return

        # Visa期限が近い学生にメール送信
        for student in visa_students:
            self._send_email(
                student,
                "Alert: Your visa will expire soon",
                f"""
                Dear {student.first_name} {student.last_name},

                Your visa will expire on {student.visa_expire_date}. Please prepare for the visa extension.
                Here are the steps to follow:
                1) Visit "http://localhost:3000" and click "Visa Extension" from the side menu.
                2) Click "Request" to request the visa extension letter.
                3) Click "Download" to download the extension form as PDF.

                Optional:
                4) Click "Van Reservation" to pick the date to reserve a van to go to immigration.

                Please contact us if there are any changes or further questions.

                Best regards,
                IAC Administration
                """,
            )

        # レポート提出期限が近い学生にメール送信
        for student in report_students:
            self._send_email(
                student,
                "Alert: Your report is due in 7 days",
                f"""
                Dear {student.first_name} {student.last_name},

                Your 90-day report is due on {student.visa_expire_date}. Please update your profile:
                1) Visit "http://localhost:3000" and click "Update profile" from the side menu.
                2) Ensure your new visa expire date is updated.
                3) Save the latest information.

                Please contact us if there are any changes or further questions.

                Best regards,
                IAC Administration
                """,
            )

        for student in visa_extended_students:
            self._send_email(
                student,
                "Update your profile",
                f"""
                Dear {student.first_name} {student.last_name},

                Your visa extension is due on {student.report_90_days_date}. Please update your profile:
                1) Visit "http://localhost:3000" and click "Update profile" from the side menu.
                2) Ensure your new 90 days report date is updated.
                3) Save the latest information.

                Please contact us if there are any changes or further questions.

                Best regards,
                IAC Administration
                """,
            )  

        for student in report_submitted_students:
            self._send_email(
                student,
                "Update your profile",
                f"""
                Dear {student.first_name} {student.last_name},

                Your 90-day report is due on {student.report_90_days_date}. if you already submit the report, please update your profile:
                1) Visit "http://localhost:3000" and click "Update profile" from the side menu.
                2) Ensure your new 90 days report date is updated.
                3) Save the latest information.

                Please contact us if there are any changes or further questions.

                Best regards,
                IAC Administration
                """,
            )        

    def _send_email(self, student, subject, message):
        """共通のメール送信ロジック"""
        email_address = student.email
        if not email_address:
            self.stdout.write(f"Skipping {student.first_name} {student.last_name}: Email address is missing.")
            return

        from_email = "non-reply@IAC.jp"
        try:
            self.stdout.write(f"Attempting to send email to {email_address}...")
            send_email = EmailMessage(
                subject, message, from_email=from_email, to=[email_address]
            )
            send_result = send_email.send()
            if send_result == 0:
                self.stdout.write(f"Failed to send email to {email_address}.")
            else:
                self.stdout.write(f"Email sent successfully to {email_address}.")
        except Exception as e:
            self.stdout.write(f"Error sending email to {email_address}: {e}")
