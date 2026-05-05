#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFiClientSecureBearSSL.h>

// WiFi credentials
const char* ssid = "OnePlus Nord CE3 5G";
const char* password = "franzz33";

// Firebase REST URL
const String firebaseURL =
"https://firestore.googleapis.com/v1/projects/digital-notice-board-7e57f/databases/(default)/documents/notices";

// LCD (16x2)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Secure client
BearSSL::WiFiClientSecure client;

// Scrolling variables
String scrollingText = "";
int scrollIndex = 0;

void setup() {
  Serial.begin(115200);

  Wire.begin(D2, D1);  // SDA, SCL for ESP8266

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Connecting WiFi");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("WiFi Connected");

  client.setInsecure();   // skip SSL certificate validation

  fetchNotices();         // fetch at startup
}

void loop() {

  // Smooth scrolling
  if (scrollingText.length() > 16) {
    String displayText = scrollingText.substring(scrollIndex, scrollIndex + 16);
    lcd.setCursor(0,0);
    lcd.print(displayText);

    scrollIndex++;

    if (scrollIndex + 16 > scrollingText.length()) {
      scrollIndex = 0;
    }

  } else {
    lcd.setCursor(0,0);
    lcd.print(scrollingText);
  }

  // Refresh notices
  static unsigned long lastFetch = 0;
  if (millis() - lastFetch > 30000) {
    fetchNotices();
    lastFetch = millis();
  }

  delay(300);
}

void fetchNotices() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;
    http.begin(client, firebaseURL);

    int httpCode = http.GET();

    if (httpCode > 0) {

      String payload = http.getString();

      const size_t capacity = 16 * 1024;
      DynamicJsonDocument doc(capacity);

      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {

        scrollingText = "";
        JsonArray documents = doc["documents"].as<JsonArray>();

        int count = 0;

        for (JsonObject notice : documents) {
          if (count >= 4) break;   // limit to 4 notices

          String text = notice["fields"]["text"]["stringValue"];

          if (scrollingText.length() > 0) {
            scrollingText += " | ";
          }

          scrollingText += text;
          count++;
        }

        scrollIndex = 0;

        Serial.println("Scrolling Text:");
        Serial.println(scrollingText);

      } else {
        Serial.println("JSON Parse Error");
      }

    } else {
      Serial.print("HTTP Error: ");
      Serial.println(httpCode);
    }

    http.end();
  }
}