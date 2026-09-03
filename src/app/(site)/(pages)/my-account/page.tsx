import MyAccount from "@/components/MyAccount";
import React from "react";
import { redirect } from "next/navigation";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
};

const MyAccountPage = () => {
  redirect("/my-account/orders");
};

export default MyAccountPage;
