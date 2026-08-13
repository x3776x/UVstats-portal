'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutTipProd() {
    return(
        <AboutModule
            title="Tipología de productores"
            description={<p>
                Programa que realiza la estratificación de una población univariada de productores 
                agropecuarios mediante la técnica de Danelius y Hodges (1959), empleando preferentemente 
                la primera componente principal del análisis de Componentes Principales basado en la 
                matriz de correlaciones.
            </p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - christianps_mx@hotmail.com", "Dra. Gabriela Eréndira Hernández Rodríguez - gabyerendira@yahoo.com.mx", "Dr. Andrés Rivera Fernández Rodríguez - rifa17@gmail.com", "Mtro. Iván Ruiz Hernández - ivan.ruiz@uv.es"]}
            webAuthor="Abraham Vazquez - x3776x"
        />
    );
}