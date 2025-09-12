import db from "../../config/db";

const RAW_DATAS = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713217/8_8_Kilap_Premium_Social_Media_Poster_phiyuu.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Promo 8.8 Kilap Premium",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712520/Avocado_Ad_laggui.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Avocado Smoothie Special Menu",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712530/Burger_Restaurant_Projects____Photos_videos_logos_illustrations_and_branding_mnccee.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Rebel Burger Ad",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712428/Cada_detalhe_foi_pensado_para_capturar_a_ess%C3%AAncia_e_a_eleg%C3%A2ncia_da_culin%C3%A1ria_japonesa_destacando_cores_vibrantes_e_uma_tipografia_que_transmite_autenticidade_e_sofistica%C3%A7%C3%A3o__Quer_ver_seu_neg%C3%B3cio_xarr1m.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Yakisoba Food Ad",
  },
  {
    id: 5,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713105/CARYOPHY___Key_Visual_Happy_New_Year_agyahx.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Caryophy New Year Promo",
  },
  {
    id: 6,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713102/CARYOPHY___Key_Visual_Merry_Christmas_vfca6y.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Caryophy Christmas Sale",
  },
  {
    id: 7,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712432/Conseda_cosmetics_soft_shower_gel__ALMA__packaging_by_Parvin_enpfhv.jpg",
    category: ["Product Showcase"],
    name: "Conseda Shower Gel Visual",
  },
  {
    id: 8,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712436/Create_content_for_brands_1_g5jzjg.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Sunscreen Summer Visual",
  },
  {
    id: 9,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712435/Create_content_for_brands_2_ivkujm.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Renew+ Sunscreen Display",
  },
  {
    id: 10,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712437/Create_content_for_brands_gc0h25.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Renew SPF 30 Visual",
  },
  {
    id: 11,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712440/Creating_AI-content_for_businesses_worldwide_erf3s5.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Sunny Spray Poolside Visual",
  },
  {
    id: 12,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712433/Creation___ALLIE%E9%98%B2%E6%99%92%E9%9C%9C%E4%BA%A7%E5%93%81%E5%88%9B%E6%84%8F%E6%8B%8D%E6%91%84_rbzfni.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Allie UV Gel Water Visual",
  },
  {
    id: 13,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712726/Creative_Poster_qducmp.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Grillme Meal Box Promo",
  },
  {
    id: 14,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712443/Crema_Solare_Viso_Sotto_Il_Trucco_Estate_2025__Le_Migliori_Per_Ogni_Pelle_cc4fmj.jpg",
    category: ["Product Showcase", "Promotional", "Announcement"],
    name: "Happy Sandwich Opening Hours",
  },
  {
    id: 15,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712529/Customizable_Sandwich_Store_Promotion_Design_Template_eppxqf.jpg",
    category: ["Product Showcase", "Promotional", "Announcement"],
    name: "KFC Thursday Fried Chicken Promo",
  },
  {
    id: 16,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712645/Desain_Sosial_Media_pw122v.jpg",
    category: ["Promotional", "Seasonal", "Announcement"],
    name: "Agustus Merdeka Promo",
  },
  {
    id: 17,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713215/download_1_nh7kon.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Krispy Kreme Holiday Donuts",
  },
  {
    id: 18,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712496/download_10_d0grwr.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "FamiCafé Beverage Promo",
  },
  {
    id: 19,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712493/download_11_vthtl0.jpg",
    category: ["Product Showcase", "Promotional", "Announcement"],
    name: "Es Kopi Flash Sale",
  },
  {
    id: 20,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712480/download_12_wjjcix.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Starbucks Coffee Visual",
  },
  {
    id: 21,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712477/download_13_vr01ih.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Steal The Moon Mid-Autumn Drink Promo",
  },
  {
    id: 22,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712472/download_14_cwozis.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Juyou Sunscreen Creative Visual",
  },
  {
    id: 23,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712459/download_15_sewdee.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Realme Neo7 Turbo Ad",
  },
  {
    id: 24,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712457/download_16_repffl.jpg",
    category: ["Product Showcase"],
    name: "Fashion and Furniture Visual",
  },
  {
    id: 25,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712456/download_17_gjh13g.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Li-Ning Sporty Chic Outfit",
  },
  {
    id: 26,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712454/download_18_xoutub.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Luxury Pattern Shirt Ad",
  },
  {
    id: 27,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712453/download_19_al2huz.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Nike x The North Face Puffer Jacket",
  },
  {
    id: 28,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713106/download_2_ama844.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "The North Face SS20 Capsule Collection",
  },
  {
    id: 29,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712449/download_20_e0wtki.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "JBL Bluetooth Earbuds Promo",
  },
  {
    id: 30,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712444/download_21_pdlmx0.jpg",
    category: ["Product Showcase"],
    name: "Xiaomi Smartphone Floating Visual",
  },
  {
    id: 31,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712444/download_22_oq2amm.jpg",
    category: ["Product Showcase", "Informational"],
    name: "Nubank Digital Banking and Card Visual",
  },
  {
    id: 32,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712434/download_23_le0w1j.jpg",
    category: ["Product Showcase", "Informational"],
    name: "Bizzabo Mobile App Visual",
  },
  {
    id: 33,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712431/download_24_mlfag9.jpg",
    category: ["Product Showcase", "Informational"],
    name: "Mobile Food Ordering App Interface",
  },
  {
    id: 34,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712430/download_25_f8iiph.jpg",
    category: ["Informational"],
    name: "Zakatpedia Smartphone Tips",
  },
  {
    id: 35,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712429/download_26_xkmebt.jpg",
    category: ["Informational"],
    name: "Berlin Navigation Map",
  },
  {
    id: 36,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712428/download_27_bjoejz.jpg",
    category: ["Product Showcase"],
    name: "iPhone Models Display",
  },
  {
    id: 37,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713240/download_28_xwrzbi.jpg",
    category: ["Product Showcase"],
    name: "Grolove Multi-Vitamin Bubble Toner",
  },
  {
    id: 38,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713094/download_3_texdhj.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Allie Extra UV Gel Sunscreen",
  },
  {
    id: 39,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713093/download_4_xni4jw.jpg",
    category: ["Product Showcase"],
    name: "Custom Phone Cases Display",
  },
  {
    id: 40,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712510/download_5_bu0ypb.jpg",
    category: ["Product Showcase"],
    name: "MagSafe Phone Case Display",
  },
  {
    id: 41,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712502/download_6_qsg3tt.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Seafood Noodle Winter Edition Poster",
  },
  {
    id: 42,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712501/download_7_k6d4ea.jpg",
    category: ["Product Showcase"],
    name: "Oliva Moisturizing Hand Cream Display",
  },
  {
    id: 43,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712499/download_8_eubyeu.jpg",
    category: ["Product Showcase"],
    name: "Hella Beauty Honey Pomelo Miracle Oils",
  },
  {
    id: 44,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712497/download_9_odvsnz.jpg",
    category: ["Product Showcase", "Seasonal"],
    name: "Festive Cupcakes Holiday Promotion",
  },
  {
    id: 45,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713108/Download_premium_image_of_Festive_cupcakes_Instagram_post_template_editable_social_media_design_about_christmas_tree_xmas_plant_tree_and_cake_12655640_tcyjsi.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Jim Rover's Sandwich 50% Discount",
  },
  {
    id: 46,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712528/Download_premium_image_of_Sandwich_recipe_poster_template_by_Aew_about_burger_sandwich_snack_bread_and_lunch_14713048_si563a.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "New Arrival Smartphone Promotion",
  },
  {
    id: 47,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712446/Download_premium_psd___image_of_Smartphone_screen_mockup_colorful_digital_device_psd_about_torn_paper_hole_paper_hole_phone_mockup_torn_paper_and_ripped_paper_4369574_pal4ev.jpg",
    category: ["Promotional", "Seasonal", "Product Showcase"],
    name: "Super Merdeka Sembako Flash Sale",
  },
  {
    id: 48,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713222/download_x0mce9.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Ecommerce Banner - T-shirt Design",
  },
  {
    id: 49,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712487/Ecommerce_Banner_Design_-_Tshirt_Template_Design_balwaq.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Feed Special Kemerdekaan Alldaybread",
  },
  {
    id: 50,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713210/Feed_Special_Kemerdekaan_Alldaybread_i7spfm.jpg",
    category: ["Entertainment"],
    name: "First Kanaphan Edit",
  },
  {
    id: 51,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712475/first_kanaphan_edit_j34wc5.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Bakmi Ayam Kecap New Menu",
  },
  {
    id: 52,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712525/FnB_Design_sunfki.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Porção Super Frango Combo",
  },
  {
    id: 53,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712535/Frango_Frito_Chicken_-_Social_Media_-_Joe_Arts_usmkck.jpg",
    category: ["Product Showcase", "Interactive"],
    name: "Frango Frito Meal Time Post",
  },
  {
    id: 54,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712534/Frango_Frito_Social_Media_PSD_Edit%C3%A1vel_dx726q.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Frappe Holiday Special",
  },
  {
    id: 55,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712511/Frappe_Social_Media_Post_Design_kyb2zr.jpg",
    category: ["Promotional", "Seasonal", "Announcement"],
    name: "Freedom Choice Discount Flyer",
  },
  {
    id: 56,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713211/Freedom_Choice_Discount_Flyer_Poster_Design_wwoya6.jpg",
    category: ["Promotional", "Seasonal", "Announcement"],
    name: "Halal Bi Halal Buffet Package",
  },
  {
    id: 57,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713225/Halal_Bi_Halal_Package_lknopi.jpg",
    category: ["Entertainment", "Promotional"],
    name: "Hello Kitty Poster Design",
  },
  {
    id: 58,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712473/hello_kitty_poster_design_idijpx.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Hoodie Manipulation Social Media Design",
  },
  {
    id: 59,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712483/Hoodie_Manipulation_Social_Media_Design___clothing_social_media_post_pz7x9k.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Hoodie Poster Design",
  },
  {
    id: 60,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712484/Hoodie_Poster_Design___Hoodie_Social_Media_banner_design___Clothing_poster_djfjdn.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Hoodie Social Media Post",
  },
  {
    id: 61,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712495/Hoodie_social_media_post_unrq2r.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Kamu Tea Single Day",
  },
  {
    id: 62,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713236/Instagram_Feed_Ramadhan_Promotion_Design_for_Ramen_Restaurant_l8hhb8.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Limited-Time Promo Ayam Betutu",
  },
  {
    id: 63,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713101/Kamu_Tea_Signle_Day_esbqrx.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Macchiato de Caramelo La Paleta",
  },
  {
    id: 64,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712730/Limited-Time_Promo_Template_Design_Banner_lz2mtk.jpg",
    category: ["Promotional", "Seasonal", "Product Showcase"],
    name: "Ramadan Special Menu Discount",
  },
  {
    id: 65,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712513/Macchiato_de_caramelo_izaw68.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Mio Mio Fruity Taste Drink",
  },
  {
    id: 66,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713239/marhaban_sddr6f.jpg",
    category: ["Product Showcase", "Informational"],
    name: "Mockup Device iPhone Business Display",
  },
  {
    id: 67,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712507/Mio_coffee_-_Drink_photography_-_Bluesea_Design_r6pe4w.jpg",
    category: ["Product Showcase", "Informational"],
    name: "Multiple Visuelle Phone Display on Books",
  },
  {
    id: 68,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712451/Mockup_Device_Iphone_h7stnc.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Nike Air Force 1 '07 LV8 Poster Design",
  },
  {
    id: 69,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712448/Multiple_visuelle_ibjw3v.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Nike Air Force Limited Edition",
  },
  {
    id: 70,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712470/Nike_Air_Force__Nike_Shoes_j6vhrx.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Mheenimal Bear Milk Frappe Cocoa",
  },
  {
    id: 71,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712468/NIKE_AIR_FORCE_1_07_LV8_Poster_Design_efmgz6.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Payday Sale Kilap Premium",
  },
  {
    id: 72,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712514/Oh_CoCoa_unvvzj.jpg",
    category: ["Promotional", "Seasonal", "Product Showcase"],
    name: "Independence Day Promo Osondoson",
  },
  {
    id: 73,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713219/Payday_sale_Kilap_Premium_Social_Media_Design_lqenxf.jpg",
    category: ["Seasonal", "Announcement"],
    name: "Poster Kemerdekaan Indonesia ke 79",
  },
  {
    id: 74,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712480/Poster_cogooq.jpg",
    category: ["Promotional", "Seasonal", "Announcement"],
    name: "Poster Promosi Buffet Ramadan Modern Putih Pasir Emas dan Coklat",
  },
  {
    id: 75,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713206/POSTER_DESIGN_tjeqes.jpg",
    category: ["Product Showcase", "Fashion"],
    name: "Poster Nightwolf x Offwhite",
  },
  {
    id: 76,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713214/Poster_Kemerdekaan_Indonesia_ke_79_lo4cqc.jpg",
    category: ["Promotional", "Product Showcase", "Seasonal"],
    name: "Promo Menantea September Ceria",
  },
  {
    id: 77,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713223/Poster_Promosi_Buffet_Ramadan_Modern_Putih_Pasir_Emas_dan_Coklat_hkkkv4.jpg",
    category: ["Promotional", "Product Showcase", "Announcement", "Seasonal"],
    name: "Promotional design for Instagram post",
  },
  {
    id: 78,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712734/Promo_Menantea_September_Ceria_vg6t0o.jpg",
    category: ["Promotional", "Product Showcase"],
    name: "Social Media - Loja de eletrônicos_celulares - Gustavo Àvalos",
  },
  {
    id: 79,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713094/Promotional_design_for_Instagram_post_ohvsxq.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Social Media - Sushi _ Restaurante Japonês - Wendel Costta",
  },
  {
    id: 80,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712466/Social_Media_-_Loja_de_eletr%C3%B4nicos_celulares_-_Gustavo_%C3%80valos_tn0jsv.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Social Media - Sushi _ Restaurante Japonês - Wendel Costta",
  },
  {
    id: 81,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712427/Social_Media_-_Sushi___Restaurante_Japon%C3%AAs_-_Wendel_Costta_1_mmgjpc.jpg",
    category: ["Informational", "Promotional"],
    name: "Social Media Banco Digital_ Instagram Post Template & Social Media Design",
  },
  {
    id: 82,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712428/Social_Media_-_Sushi___Restaurante_Japon%C3%AAs_-_Wendel_Costta_c8i09j.jpg",
    category: ["Informational", "Promotional"],
    name: "Social Media Design _ Banco Digital Startup",
  },
  {
    id: 83,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712465/Social_Media_Banco_Digital__Instagram_Post_Template_Social_Media_Design_sgvbtf.jpg",
    category: ["Interactive", "Entertainment", "Promotional"],
    name: "Social Media Design - Quiz Menu yang Bikin Kamu Nanya",
  },
  {
    id: 84,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712462/Social_Media_Design___Banco_Digital_Startup_hrgjtd.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "SeginamM - 18K Bisa Dapat Kopita, Sutejo, Suren",
  },
  {
    id: 85,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712524/Social_Media_Design_dithoo.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Chikiez - We Fry It Fresh",
  },
  {
    id: 86,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712522/Social_Media_Feed_reh1sj.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Malabar Makkan - Chicken Kondattam",
  },
  {
    id: 87,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712535/Social_Media_Vol_1_-_Yasser_Charisma_n63qwb.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Starbucks Merdeka Duo Promo",
  },
  {
    id: 88,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712646/Spice_lovers_your_perfect_dish_has_arrived_Presenting_our_fiery_and_flavourful_Chicken_Kondattam_rf8mv3.jpg",
    category: ["Product Showcase", "Seasonal", "Promotional", "Entertainment"],
    name: "Sunscreen, Sip, and Slay – All Day, Every Day!",
  },
  {
    id: 89,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713207/Starbucks_Indonesia_s_Instagram_post__Siap-siap_menyambut_Hari_Kemerdekaan_dengan_menikmati_beragam_promo_eksklusif_dari_Starbucks_Mulai_dari_paket_2_minuman_Merdeka_wwabbq.jpg",
    category: ["Product Showcase", "Informational", "Promotional"],
    name: "Goulash Stew Hungary Food",
  },
  {
    id: 90,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712441/Sunscreen_Sip_and_Slay_All_Day_Every_Day_kjxwih.jpg",
    category: ["Product Showcase", "Promotional", "Seasonal"],
    name: "Tiramisu Latte",
  },
  {
    id: 91,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712489/T-shirt_Social_Media_Post_Design_-_Mojahidul_Islam_giijbn.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Green Potter T-shirt",
  },
  {
    id: 92,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713236/Taste_of_Hungary__Vintage_Food_Poster_aioa45.jpg",
    category: ["Product Showcase", "Fashion"],
    name: "Undercover Floral Shirt",
  },
  {
    id: 93,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753713205/Tiramisu_Latte_Waffle_-_EPHRAIM_INNOVATION_v79gor.jpg",
    category: ["Product Showcase", "Technology", "Creative Visual"],
    name: "vista_ Digital Detox Phone",
  },
  {
    id: 94,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712492/Undercover_srvh4l.jpg",
    category: ["Product Showcase", "Fashion", "Creative Visual"],
    name: "Wacko Maria Shirt",
  },
  {
    id: 95,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712460/vista__Digital_Detox_Phone_-_Junha_Kahm_fmmy7k.jpg",
    category: ["Product Showcase", "Promotional", "Fashion"],
    name: "Destiny Sweatshirt Winter Clothing Sale",
  },
  {
    id: 96,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712490/Wacko_Maria_abpnrq.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Avocado Smoothie",
  },
  {
    id: 97,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712486/Winter_Clothing_Sale_Banner_Design_sbac5s.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Winter Clothing Sale Banner",
  },
  {
    id: 98,
    url: "https://res.cloudinary.com/dudo4q4je/image/upload/v1753712519/%E0%B8%AA%E0%B8%B5%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%A7_%E0%B8%AA%E0%B8%94%E0%B9%83%E0%B8%AA_%E0%B8%AA%E0%B8%99%E0%B8%B8%E0%B8%81%E0%B8%AA%E0%B8%99%E0%B8%B2%E0%B8%99_%E0%B9%80%E0%B8%A1%E0%B8%99%E0%B8%B9_%E0%B8%AD%E0%B8%B0%E0%B9%82%E0%B8%A7%E0%B8%84%E0%B8%B2%E0%B9%82%E0%B8%94_%E0%B9%82%E0%B8%9B%E0%B8%AA%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C_wshcnp.jpg",
    category: ["Product Showcase", "Promotional"],
    name: "Colorful Avocado Poster",
  },
];

async function main() {
  try {
    console.log("Seeding template...");
    await db.$connect;

    // await db.templateCategory.deleteMany();
    // await db.templateImage.deleteMany();
    await db.templateImageCategory.deleteMany();
    await db.templateImageContent.deleteMany();

    console.log("Checking if template already seeded...");
    const templateCategories = await db.templateImageCategory.findMany();
    const templateImages = await db.templateImageContent.findMany();

    console.log("Template categories:", templateCategories);
    console.log("Template images:", templateImages);

    if (templateCategories.length > 0 && templateImages.length > 0) {
      console.log("Template already seeded");
      return;
    }

    console.log("Seeding template categories...");
    const uniqueNameCategories = new Set<string>();
    for (const data of RAW_DATAS) {
      for (const category of data.category) {
        uniqueNameCategories.add(category);
      }
    }

    const createCategories = await db.templateImageCategory.createManyAndReturn({
      data: Array.from(uniqueNameCategories).map((name) => ({
        name,
      })),
    });

    console.log("Seeded template categories");
    console.table(createCategories);

    for await (const data of RAW_DATAS) {
      const categories = createCategories.filter((category) =>
        data.category.includes(category.name)
      );

      await db.templateImageContent.create({
        data: {
          name: data.name,
          imageUrl: data.url,
          isPublished: true,
          templateImageCategories: {
            connect: categories.map((category) => ({
              id: category.id,
            })),
          },
        },
      });

      console.log(
        `Seeded ${data.name} with ${categories
          .map((c) => c.name)
          .join(", ")} categories`
      );
    }

    console.log("Seeded all templates");
  } catch (error) {
    console.log(error);
  } finally {
    await db.$disconnect();
  }
}

main();