import json
import logging
import boto3
from datetime import datetime, timezone

# Thiết lập logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Clients
sns = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')

# Hằng số
SNS_TOPIC_ARN = "arn:aws:sns:ap-southeast-2:018889389183:IoT_Noti"
DDB_TABLE_NAME = "iot_db_test"

def lambda_handler(event, context):
    try:
        logger.info("Nhận dữ liệu từ IoT Core: %s", json.dumps(event))

        # Một số IoT Rule gửi dữ liệu trực tiếp, một số có 'payload'
        payload = event.get('payload', event)
        if isinstance(payload, str):
            payload = json.loads(payload)

        # Trích xuất thông tin
        device_id = payload.get("device_id", 0)
        ts = payload.get("timestamp")
        temp = payload.get("temperature")
        hum = payload.get("humidity")

        # Nếu không có timestamp → dùng thời gian hiện tại
        if ts is None:
            ts = int(datetime.now(timezone.utc).timestamp())

        time_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        logger.info(f"Thiết bị: {device_id}")
        logger.info(f"Thời gian: {time_str}")
        logger.info(f"Nhiệt độ: {temp}°C | Độ ẩm: {hum}%")

        # ====== Kiểm tra ngưỡng ======
        alerts = []

        if temp is not None and temp > 35:
            alerts.append(f"Nhiệt độ cao ({temp}°C)")
        elif temp is not None and temp < 10:
            alerts.append(f"Nhiệt độ thấp ({temp}°C)")

        if hum is not None and hum > 80:
            alerts.append(f"Độ ẩm cao ({hum}%)")
        elif hum is not None and hum < 30:
            alerts.append(f"Độ ẩm thấp ({hum}%)")

        # ====== Lưu log vào DynamoDB ======
        table = dynamodb.Table("iot_db_test")
        item = {
            "sample_time": int(ts),           # Partition key
            "device_id": int(device_id),      # Sort key
            "temperature": temp,
            "humidity": hum,
            "alerts": alerts,
            "time_str": time_str
        }

        table.put_item(Item=item)
        logger.info("Đã lưu dữ liệu vào DynamoDB: %s", json.dumps(item))

        # ====== Nếu có cảnh báo, gửi SNS ======
        if alerts:
            message = (
                f"Cảnh báo từ thiết bị {device_id}\n"
                f"Thời gian: {time_str}\n"
                f"Thông tin: {', '.join(alerts)}\n"
                f"Nhiệt độ hiện tại: {temp}°C\n"
                f"Độ ẩm hiện tại: {hum}%"
            )
            logger.warning(f"CẢNH BÁO: {message}")

            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"Cảnh báo môi trường - {device_id}",
                Message=message
            )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Dữ liệu xử lý và lưu thành công!",
                "device": device_id,
                "temperature": temp,
                "humidity": hum,
                "alerts": alerts
            })
        }

    except Exception as e:
        logger.error(f"Lỗi xử lý dữ liệu: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
