'use client';

import AboutModule from "@/components/aboutModule";

export default function AboutEffRelat() {
    return(
        <AboutModule
            title="Acerca del modulo Eficiencia relativa."
            description={<p>Este módulo calcula la eficiencia relativa
                para evaluar si el diseño es correcto con respecto a otro menos complejo
            </p>}
            originalAuthors={["Dr. Juan Ruíz - jruiz@uv.mx", "Mtro. Christian Pérez Salazar - chperez@uv.mx"]}
            webAuthor="Abraham Vázquez"
        />
    );
}