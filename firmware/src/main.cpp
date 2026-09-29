#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

#define sens_Hum_suelo      A0  // FC-28 AO
#define sens_luz             A1  // LDR
#define sens_ph              A2  // PH-4502C Po
#define sens_temp_suelo      2   // DS18B20
#define sens_aire            3   // DHT11 DATA
#define alim_suelo           7   // FC-28 VCC

unsigned long wait = 10000; // tiempo asignado a la espera global entre cada medicion 

DHT dht(sens_aire , DHT11);


float leersensor (int pin , int escala){  // funcion que sirve para leer los sensores que no tienen librerias 
    int valor = analogRead(pin);
    return (valor / 1023.0) * escala;
};

float leerHumAire(){
    return dht.readHumidity();
};


float leerTempAire(){
    return dht.readTemperature();
};

float leerHumSuelo()
{
  digitalWrite(alim_suelo, HIGH);
  delay(10);
  float suelo = 100.0 - leersensor(sens_Hum_suelo, 100);
  digitalWrite(alim_suelo, LOW);
  return suelo;
}

void enviar (float sensor , bool ultimo) { //neviar las mediciones en el orden que tiene que ser. el bool indica cual es el ultimo sensor en el orden
    Serial.print(sensor, 1);
    if (ultimo == true){
        Serial.println();
    } else {Serial.print(",");}
};

void setup () {
    Serial.begin(9600);
    pinMode(alim_suelo, OUTPUT);
    digitalWrite(alim_suelo, LOW);
    dht.begin();
};

void loop(){ 
    float HumAire = leerHumAire();
    float TempAire = leerTempAire();
    float HumSuelo = leerHumSuelo();
    
    enviar(HumSuelo , false);
    enviar(0,false);
    enviar(HumAire , false);
    enviar(T0 , false);
    enviar(0,false);
    enviar(0,true);

    delay(wait);
};