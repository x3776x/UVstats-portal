'use client'

import { act, useState } from 'react';
import Link from "next/link";

import AboutModule from "@/components/aboutModule";

export default function EffRelatPage() {
    const [activeKey, setActiveKey] = useState<'ABOUT'>('ABOUT');

    return(
        <h1>Hello</h1>
    );
}