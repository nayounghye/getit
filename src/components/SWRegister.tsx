"use client";

import { useEffect } from "react";
import { registerSW } from "@/lib/register-sw";

export default function SWRegister() {
  useEffect(() => {
    registerSW();
  }, []);
  return null;
}
