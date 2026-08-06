'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutInfEst() {
    return(
        <AboutModule
            title="Acerca del modulo Inferencia Estadística."
            description={<p>El módulo de Inferencia Estadistica calcula intervalos de confianza
                y realiza pruebas de hipotesis para la media aritmetica y la proporcion para uno o dos grupos.</p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Dr. Ivan Ruiz Hernandez - ivan.ruiz@uv.es",
                "Mtro. Zoylo Morales Romero - zmorales@uv.mx", "Axel Panama Velazquez", "Bryan Alexis Jimenez Santiago"]}
            webAuthor="Abraham Vázquez"
        />
    );
}