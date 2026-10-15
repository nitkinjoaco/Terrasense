// Terrasense - firmware para el hardware real
// Solo mide y manda. Una linea CSV por medicion:
//   humSuelo,tempSuelo,humAire,tempAire,luz,ph
// El back (parser.ts) se encarga de validar y armar el objeto.
//
// Librerias: "DHT sensor library" (Adafruit), "OneWire", "DallasTemperature"

#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define sens_suelo      A0  // FC-28 AO
#define sens_luz        A1  // LDR
#define sens_ph         A2  // PH-4502C Po
#define sens_temp_suelo 2   // DS18B20
#define sens_aire       10   // DHT11 DATA
#define alim_suelo      7   // FC-28 VCC

unsigned long wait = 5000; // 1 lectura por minuto (int no llega a 60000 en el Uno)

DHT dht(sens_aire, DHT11);
OneWire oneWire(sens_temp_suelo);
DallasTemperature ds18b20(&oneWire);

void setup()
{
  Serial.begin(9600);
  pinMode(alim_suelo, OUTPUT);
  dht.begin();
  ds18b20.begin();
}

// Lee un pin, lo mapea a la escala y devuelve el valor
float leerSensor(int pin, float escala)
{
  int valor = analogRead(pin);
  return (valor / 1023.0) * escala;
}

// FC-28: se prende solo para medir. Mas humedad = valor mas bajo, por eso 100 - ...
float leerHumedadSuelo()
{
  digitalWrite(alim_suelo, HIGH);
  delay(10);
  float suelo = 100.0 - leerSensor(sens_suelo, 100.0);
  digitalWrite(alim_suelo, LOW);
  return suelo;
}

// DS18B20: devuelve -127 si no esta conectado
float leerTempSuelo()
{
  ds18b20.requestTemperatures();
  return ds18b20.getTempCByIndex(0);
}

// DHT11: devuelven NAN si falla la lectura
float leerHumedadAire()
{
  return dht.readHumidity();
}

float leerTempAire()
{
  return dht.readTemperature();
}

// LDR: mas luz = numero mas alto (0 a 100 %)
float leerLuz()
{
  return leerSensor(sens_luz, 100.0);
}

// PH-4502C: 2.5 V = pH 7, cada unidad = 0.18 V
float leerPh()
{
  float volts = leerSensor(sens_ph, 5.0);
  return 7.0 + (2.5 - volts) / 0.18;
}

// Manda un valor y despues una coma (o el fin de linea si es el ultimo)
void enviar(float valor, bool ultimo)
{
  Serial.print(valor, 1);
  if (ultimo) Serial.println();
  else        Serial.print(",");
}

void loop()
{
  float suelo     = leerHumedadSuelo();
  float tempSuelo = leerTempSuelo();
  float aire      = leerHumedadAire();
  float tempAire  = leerTempAire();
  float luz       = leerLuz();
  float ph        = leerPh();

  // Orden del contrato: humSuelo,tempSuelo,humAire,tempAire,luz,ph
  enviar(suelo,     false);
  enviar(tempSuelo, false);
  enviar(aire,      false);
  enviar(tempAire,  false);
  enviar(0,       false);
  enviar(ph,        true);

  delay(wait);
}