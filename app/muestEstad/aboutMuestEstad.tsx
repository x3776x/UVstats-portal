'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutMuestEstad() {
    return(
        <AboutModule
            title="Acerca del modulo Muestreo Estadístico."
            description={<p>Programa que calcula el tamaño de muestra y los parámetros poblacionales: 
                Varianza, Límite de error de estimacion e Intervalos de confianza; para la media total
                y proporcion poblacional de los muestreos: Aleatorio simple, Estratificado, Sistemático y por Conglomerados.
            </p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Mtra. Gabriela Eréndira Hernández Rodríguez - gabyerendira@yahoo.com.mx"]}
            webAuthor="Abraham Vázquez"
        />
    );
}