#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

#define sens_aire_suelo      A0  // FC-28 AO
#define sens_luz             A1  // LDR
#define sens_ph              A2  // PH-4502C Po
#define sens_temp_suelo      2   // DS18B20
#define sens_aire            3   // DHT11 
#define alim_suelo           7   // FC-28 VCC

unsigned long wait = 10000; // tiempo asignado a la espera global entre cada medicion 

DHT dht(sens_aire , DHT11);


float leersensor (int pin , int escala){  // funcion que sirve para leer los sensores que no tienen librerias y analogicos 
    int valor = analogRead(pin);
    return (valor / 1023.0) * escala;
};

float leerHumAire(){
    return dht.readHumidity();
};


float leerTempAire(){
    return dht.readTemperature();
};

float LeerHumSuelo(){
    digitalWrite(alim_suelo , HIGH);
    delay(20);
    float i = leersensor(sens_temp_suelo , 1);
    float humedad = 100.0 -(i*100);
    digitalWrite(alim_suelo, LOW);
    return humedad;
};

void enviar (float sensor , bool ultimo) { //neviar las mediciones en el orden que tiene que ser. el bool indica cual es el ultimo sensor en el orden
    Serial.print(sensor);
    if (ultimo == true){
        Serial.println();
    } else {Serial.print(",");}
};

void setup () {
    Serial.begin(9600);
    dht.begin();

    pinMode(alim_suelo , 7);
};

void loop(){ 
    float HumAire = leerHumAire();
    float TempAire = leerTempAire();
    float HumsSuelo = LeerHumSuelo();
    float Luz =  leersensor(sens_luz , 100);
    float ph = leersensor(sens_ph, 5);
        
    enviar(HumsSuelo,false);
    enviar(0,false);
    enviar(HumAire , false);
    enviar(TempAire , false);
    enviar(0,false);
    enviar(0,true);

    delay(wait);
};