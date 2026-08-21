'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutGEGasolinas() {
    return (
        <AboutModule
            title="Acerca del módulo GE Gasolinas"
            description={<p>Programa utilizado para generar escenarios del consumo de gasolinas y 
                la producción de etanol en México</p>}
            originalAuthors={["Dr. Juan Ruiz - jruiz@uv", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Dra. Gabriela Eréndira Rodríguez - gabyerendira@yahoo.com.mx"]}
            webAuthor="Abraham Vazquez - x3776x"
        />
    )
}