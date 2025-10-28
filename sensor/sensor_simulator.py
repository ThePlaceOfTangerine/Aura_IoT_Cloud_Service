import time
import json
import random
from awscrt import io, mqtt
from awsiot import mqtt_connection_builder


# --- Cấu hình AWS IoT Core ---
HOST = "a3k2j9mg1vdzk4-ats.iot.ap-southeast-2.amazonaws.com"
ROOT_CA = "Key_pair/Certificate/AmazonRootCA1.pem"
PRIVATE_KEY = "Key_pair/Key_files/41e0d6dc477abe63e116eda3ad879703c73d28d7c95cc7c8b840e6e94172381f-private.pem.key"
CERTIFICATE = "Key_pair/Certificate/41e0d6dc477abe63e116eda3ad879703c73d28d7c95cc7c8b840e6e94172381f-certificate.pem.crt"
CLIENT_ID = "sensor_01"
TOPIC = "sensor/data/temp"
REGION = "ap-southeast-2"


# --- Khởi tạo MQTT Client ---
event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)

mqtt_connection = mqtt_connection_builder.mtls_from_path(
    endpoint=HOST,
    cert_filepath=CERTIFICATE,
    pri_key_filepath=PRIVATE_KEY,
    client_bootstrap=client_bootstrap,
    ca_filepath=ROOT_CA,
    client_id=CLIENT_ID,
    clean_session=False,
    keep_alive_secs=6
)

print(f"Đang kết nối tới {HOST} với client ID: {CLIENT_ID}...")
connect_future = mqtt_connection.connect()
connect_future.result()
print("Đã kết nối!")


# --- Mô phỏng dữ liệu cảm ---
try:
    while True:
        temperature = round(random.uniform(20.0, 50.0), 2)  # Nhiệt độ giả lập từ 20.0 đến 50.0
        humidity = round(random.uniform(40.0, 90.0), 2)     # Độ ẩm giả lập từ 30.0 đến 90.0

        payload = {
            "device_id": CLIENT_ID,
            "timestamp": int(time.time()),
            "temperature": temperature,
            "humidity": humidity
        }

        message = json.dumps(payload)
        print(f"Đang gửi: {message}")
        mqtt_connection.publish(
            topic=TOPIC,
            payload=message,
            qos=mqtt.QoS.AT_LEAST_ONCE # Tương đương QoS 1
        )

        time.sleep(5)  # Gửi dữ liệu mỗi 5 giây

except KeyboardInterrupt:
    print("Ngắt kết nối...")
    disconnect_future = mqtt_connection.disconnect()
    disconnect_future.result()
    print("Đã ngắt kết nối.") 