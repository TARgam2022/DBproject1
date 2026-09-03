"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { Product } from "@/types/product";
import ProductImage from "../../Common/ProductImage";

const HeroCarousal = ({ products }: { products: Product[] }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {products.map((product, key) => (
        <SwiperSlide key={product.id}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                  {Math.round(
                    ((product.price - product.discountedPrice) / product.price) * 100
                  ) || 30}
                  %
                </span>
                <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                <a href="#">{product.title}</a>
              </h1>

              <p>
                {product.description ||
                  `Starting at just $${product.discountedPrice} — limited time offer.`}
              </p>

              <span className="block font-medium text-heading-5 text-red mt-5">
                ${product.discountedPrice}
                <span className="ml-2 font-medium text-2xl text-dark-4 line-through">
                  ${product.price}
                </span>
              </span>

              <a
                href="#"
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
              >
                Shop Now
                <span className="sr-only">{key + 1}</span>
              </a>
            </div>

            <div>
              <ProductImage
                src={product.imgs?.previews?.[0] || ""}
                alt={product.title}
                width={351}
                height={358}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
