"use client";
import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import ProductImage from "../../Common/ProductImage";
import { Product } from "@/types/product";

const Hero = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const all: Product[] = json?.products ?? [];
        const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 8);
        setProducts(shuffled);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const rightCards = products.slice(0, 2);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel products={products} />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {rightCards.map((product) => (
                <div
                  key={product.id}
                  className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5"
                >
                  <div className="flex items-center gap-14">
                    <div>
                      <h2 className="max-w-[200px] font-semibold text-dark text-xl mb-5">
                        <a href="#">{product.title}</a>
                      </h2>

                      <div>
                        <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                          limited time offer
                        </p>
                        <span className="flex items-center gap-3">
                          <span className="font-medium text-heading-5 text-red">
                            ${product.discountedPrice}
                          </span>
                          <span className="font-medium text-2xl text-dark-4 line-through">
                            ${product.price}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <ProductImage
                        src={product.imgs?.previews?.[0] || ""}
                        alt={product.title}
                        width={123}
                        height={161}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {rightCards.length === 0 && (
                <>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center gap-14">
                      <div>
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                          <a href="#"> iPhone 14 Plus & 14 Pro Max </a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            limited time offer
                          </p>
                          <span className="flex items-center gap-3">
                            <span className="font-medium text-heading-5 text-red">
                              $699
                            </span>
                            <span className="font-medium text-2xl text-dark-4 line-through">
                              $999
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <Image
                          src="/images/hero/hero-02.png"
                          alt="mobile image"
                          width={123}
                          height={161}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center gap-14">
                      <div>
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                          <a href="#"> Wireless Headphone </a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            limited time offer
                          </p>
                          <span className="flex items-center gap-3">
                            <span className="font-medium text-heading-5 text-red">
                              $699
                            </span>
                            <span className="font-medium text-2xl text-dark-4 line-through">
                              $999
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <Image
                          src="/images/hero/hero-01.png"
                          alt="mobile image"
                          width={123}
                          height={161}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
