'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutEscDesc() {
    return(
        <AboutModule
            title="Acerca del modulo Estadística descriptiva."
            description={<p>El módulo de estadística descriptiva realiza el cálculo de algunas estadísticas descriptivas, tales como 
                medias de tendencia central y de dispersión, tablas y gráficos de frecuencias</p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Dr. Ivan Ruiz Hernandez - ivan.ruiz@uv.es"]}
            webAuthor="Abraham Vázquez"
        />
    );
}