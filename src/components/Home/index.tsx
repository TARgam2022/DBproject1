import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";

const Home = () => {
  return (
    <main>
      <Hero />
      <NewArrival />
      <BestSeller />
    </main>
  );
};

export default Home;
