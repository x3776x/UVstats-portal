'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutEstratificacion() {
    return(
        <AboutModule
            title="Acerca del módulo Estratificación."
            description={<p>
                Programa que realiza la estratificación univariada de una poblacion heterogénea 
                que pueden ser productores agropecuarios, empresas, etc., consierando si existe 
                la simetría de los datos para ello se emplea la técnica de Dalenius y Hodges (1959)
                o si son asímetricos, el método de estratificación geométrica.
            </p>}
            originalAuthors={
                ["Dr. Juan Ruiz Ramírez - jruizuv@gmail.com", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Mtro. Iván Ruiz Hernández - ivan.ruiz@uv.es",
                "Dra. Gabriela Eréndira Hernández Rodríguez - gabyerendira@yahoo.com.mx", "Dr. Romeo Ruiz Bello - rorubester@gmail.com",
                ]
            }
            webAuthor="Abraham Vázquez - x3776x"
        />
    )
}