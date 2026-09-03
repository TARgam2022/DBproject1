"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Orders from "../Orders";
import ProductList from "./ProductList";
import EditProductForm from "./EditProductForm";
import { useAuth } from "@/app/context/AuthContext";

function AddProductForm() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        title,
        price: Number(price),
      };
      if (discountedPrice) body.discountedPrice = Number(discountedPrice);
      if (categoryId) body.categoryId = Number(categoryId);
      if (thumbnail) body.thumbnail = thumbnail;
      if (description) body.description = description;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Product added successfully!");
        setTitle("");
        setPrice("");
        setDiscountedPrice("");
        setCategoryId("");
        setThumbnail("");
        setDescription("");
      } else {
        setMessage(data.error ?? "Failed to add product");
      }
    } catch {
      setMessage("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <h3 className="font-medium text-xl text-dark mb-5">Add New Product</h3>
      {message && (
        <p
          className={`mb-5 text-custom-sm ${
            message.includes("success") ? "text-green" : "text-red"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="productTitle" className="block mb-2.5">
            Product Title <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="productTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Product name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="productPrice" className="block mb-2.5">
              Price <span className="text-red">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="productPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="w-full">
            <label htmlFor="productDiscounted" className="block mb-2.5">
              Discounted Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="productDiscounted"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="0.00 (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="productCategory" className="block mb-2.5">
              Category ID
            </label>
            <input
              type="number"
              min="0"
              id="productCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Optional"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="w-full">
            <label htmlFor="productThumbnail" className="block mb-2.5">
              Thumbnail URL
            </label>
            <input
              type="text"
              id="productThumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://... (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>
        <div className="mb-5">
          <label htmlFor="productDescription" className="block mb-2.5">
            Description
          </label>
          <textarea
            id="productDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Product description (optional)"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

const MyAccount = ({ activeTab = "account-details" }) => {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editProductId = searchParams.get("id")

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user?.name]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveProfile = () => {
    setProfilePreview("__remove__");
  };

  const handleSaveProfilePicture = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      let image: string | null = null;
      if (profilePreview && profilePreview !== "__remove__") {
        image = profilePreview;
      } else if (profilePreview === "__remove__") {
        image = null;
      } else if (user?.image) {
        image = user.image;
      } else {
        image = null;
      }
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        setProfilePreview(null);
        setProfileMsg("Profile picture updated successfully!");
      } else {
        setProfileMsg(data.error ?? "Failed to update profile picture");
      }
    } catch {
      setProfileMsg("Failed to update profile picture");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        setNameMsg("Account details updated successfully!");
      } else {
        setNameMsg(data.error ?? "Failed to update account details");
      }
    } catch {
      setNameMsg("Failed to update account details");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordMsg("Password changed successfully!");
      } else {
        setPasswordMsg(data.error ?? "Failed to change password");
      }
    } catch {
      setPasswordMsg("Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const navItems = [
    { key: "orders", label: "Orders" },
    { key: "account-details", label: "Account Details" },
    ...(user?.role === "admin"
      ? [
          { key: "product-list", label: "Manage Products" },
          { key: "add-product", label: "Add Product" },
        ]
      : []),
  ];

  const isActive = (key: string) => activeTab === key;

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-1">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-xl font-semibold text-blue bg-blue/10">
                        {user ? user.name.charAt(0).toUpperCase() : "?"}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {user ? user.name : "Guest"}
                    </p>
                    <p className="text-custom-xs">
                      {user ? user.email : "Not signed in"}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.key}
                        href={`/my-account/${item.key}`}
                        className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                          isActive(item.key)
                            ? "text-white bg-blue"
                            : "text-dark-2 bg-gray-1"
                        }`}
                      >
                        <span className="text-custom-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        isActive("logout")
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <span className="text-custom-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==--> */}

            {/* orders tab content start */}
            {activeTab === "orders" && (
              <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
                <Orders />
              </div>
            )}
            {/* orders tab content end */}

            {/* details tab content start */}
            {activeTab === "account-details" && (
              <div className="xl:max-w-[770px] w-full">
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-5">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-1 border border-gray-3">
                      {profilePreview || user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profilePreview || user?.image}
                          alt="profile"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-3xl font-semibold text-blue bg-blue/10">
                          {user ? user.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-xl text-dark mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-custom-sm text-dark-5 mb-3">
                        Upload a photo for your account profile.
                      </p>
                      <label
                        htmlFor="profileUpload"
                        className="inline-flex font-medium text-white bg-blue py-2 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark text-custom-sm cursor-pointer"
                      >
                        {profilePreview || user?.image ? "Change Photo" : "Upload Photo"}
                        <input
                          type="file"
                          id="profileUpload"
                          accept="image/*"
                          onChange={handleProfileFile}
                          className="hidden"
                        />
                      </label>
                      {(profilePreview || user?.image) && (
                        <button
                          onClick={handleRemoveProfile}
                          className="inline-flex font-medium text-red bg-transparent border border-red py-2 px-5 rounded-md ease-out duration-200 hover:bg-red hover:text-white text-custom-sm ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveProfilePicture}
                    disabled={savingProfile}
                    className="inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save Photo"}
                  </button>
                  {profileMsg && (
                    <p
                      className={`mt-3 text-custom-sm ${
                        profileMsg.includes("success")
                          ? "text-green"
                          : "text-red"
                      }`}
                    >
                      {profileMsg}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleUpdateName}
                  className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-5"
                >
                  <h3 className="font-medium text-xl text-dark mb-5">
                    Account Details
                  </h3>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="name" className="block mb-2.5">
                        Full Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Your full name"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={user?.email || ""}
                      readOnly
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingName}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
                  >
                    {savingName ? "Saving..." : "Save Changes"}
                  </button>
                  {nameMsg && (
                    <p
                      className={`mt-3 text-custom-sm ${
                        nameMsg.includes("success") ? "text-green" : "text-red"
                      }`}
                    >
                      {nameMsg}
                    </p>
                  )}
                </form>

                <form
                  onSubmit={handleChangePassword}
                  className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5"
                >
                  <h3 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Password Change
                  </h3>
                  <div className="mb-5">
                    <label htmlFor="oldPassword" className="block mb-2.5">
                      Old Password
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block mb-2.5"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
                  >
                    {savingPassword ? "Changing..." : "Change Password"}
                  </button>
                  {passwordMsg && (
                    <p
                      className={`mt-3 text-custom-sm ${
                        passwordMsg.includes("success")
                          ? "text-green"
                          : "text-red"
                      }`}
                    >
                      {passwordMsg}
                    </p>
                  )}
                </form>
              </div>
            )}
            {/* details tab content end */}

            {/* add-product tab content start */}
            {activeTab === "add-product" && user?.role === "admin" && (
              <AddProductForm />
            )}
            {/* add-product tab content end */}

            {/* product-list tab content start */}
            {activeTab === "product-list" && user?.role === "admin" && (
              <ProductList
                onEdit={(id) => {
                  router.push(`/my-account/edit-product?id=${id}`);
                }}
              />
            )}
            {/* product-list tab content end */}

            {/* edit-product tab content start */}
            {activeTab === "edit-product" && user?.role === "admin" && (
              <EditProductForm
                productId={Number(editProductId) || 0}
              />
            )}
            {/* edit-product tab content end */}
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccount;
