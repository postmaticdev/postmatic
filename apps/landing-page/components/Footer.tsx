import {
  ADDRESS,
  COMMUNITY_URL,
  COMPANY_NAME,
  EMAIL,
  FACEBOOK,
  INSTAGRAM,
  LINKEDIN,
  PHONE_NUMBER,
  TWITTER,
} from "@/constants";
import { IMAGE_PATH } from "@/constants/path-file";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getContainerMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className={cn(getContainerMargins(), "py-12 md:py-16")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info - Adjusted for 1024px */}
          <div className="lg:col-span-1 md:col-span-2 text-center md:text-left">
            <Link
              href="/#home"
              className="flex flex-col w-full justify-center items-center space-x-0 md:space-x-2 mb-4 cursor-pointer"
            >
              <Image
                src={IMAGE_PATH}
                alt="AI Marketing Assistant"
                className=" text-blue-600 dark:text-blue-400 mx-auto md:mx-0 mb-2 md:mb-0"
                width={48}
                height={48}
              />
              <span className="text-lg sm:text-xl lg:text-2xl font-extrabold">
                {COMPANY_NAME}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed text-xs sm:text-sm lg:text-base max-w-md mx-auto md:mx-0">
              Platform AI terdepan untuk mengotomasi pemasaran digital suatu Bisnis
              Indonesia.
            </p>
            <div className="flex justify-center space-x-3 lg:space-x-4">
              <a
                href={FACEBOOK}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <a
                href={INSTAGRAM}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <a
                href={TWITTER}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={LINKEDIN}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-3 lg:mb-4">
              Platform
            </h3>
            <ul className="space-y-1.5 lg:space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Harga
                </Link>
              </li>
              <li>
                <a
                  href="/status-system"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Status System
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">
              Resources
            </h3>
            <ul className="space-y-1.5 lg:space-y-2">
              <li>
                {/* REDIRECT TO POSTMATIC INSTAGRAM */}
                <a
                  href={COMMUNITY_URL}
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Community
                </a>
              </li>
              <li>
                <Link
                  href="/#tutorial"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Tutorial
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${PHONE_NUMBER}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact - Adjusted for better fit */}
          <div className="text-center md:text-left">
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">
              Kontak
            </h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2 lg:space-x-3">
                <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm lg:text-base break-all">
                  {EMAIL}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 lg:space-x-3">
                <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm lg:text-base">
                  {PHONE_NUMBER}
                </span>
              </div>
              <div className="flex items-start justify-center md:justify-start space-x-2 lg:space-x-3">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span
                  dangerouslySetInnerHTML={{ __html: ADDRESS }}
                  className="text-gray-400 text-sm lg:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Adjusted spacing */}
        <div className="border-t border-gray-800 mt-8 lg:mt-12 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-gray-400 text-xs lg:text-sm">
              © {currentYear} POSTMATIC. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end space-x-4 lg:space-x-6 text-xs lg:text-sm">
              <a
                href="/privacy-policy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/data-deletion"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Data Deletion
              </a>
              <a
                href="/cookie-policy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-gray-500 text-xs lg:text-sm">
              Didukung oleh teknologi AI terdepan untuk mengotomasi social media bisnis
              Indonesia 🇮🇩
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
