'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutAnova() {
    return(
        <AboutModule
            title="Acerca del módulo ANOVA."
            description={<p>El módulo de ANOVA realiza el analisis de varianza de los principales disenios experimentales y de tratamientos mediante modulos de efectos fijos con su correspondiente estimacion de un dato daltante y su comparacion de medias mediante la prueba de Tukey y con contrastes ortogonales y ademas evalua la eiciencia
                 del diseño experimental empleado mediante el calculo de eficiencia relativa.</p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - chperez@uv.mx", "Mtra. Ana Luz Polo apolo@uv.m", "Dra. Gabriela Eréndira Hernández gabyerendira@yahoo.com", "Dr. Iván Hernández - ivan.ruiz@uv.es"]}
            webAuthor="Abraham Vázquez"
        />
    );
}