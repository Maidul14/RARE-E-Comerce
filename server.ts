import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// SHA-256 password hashing helper for backend authentication
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Seed category details
const seedCategories = [
  { id: "1", name: "Tech & Electronics", slug: "tech-electronics" },
  { id: "2", name: "Apparel & Luxury Fashion", slug: "apparel-luxury-fashion" },
  { id: "3", name: "Furniture & Living", slug: "furniture-living" },
  { id: "4", name: "Home Decoration & Accents", slug: "home-decoration-accents" }
];

function generateProducts() {
  const seedBases = [
    // Tech & Electronics (Category 1)
    {
      categoryId: "1",
      name: "Apple iPhone 16 Pro Max (512GB, Natural Titanium)",
      price: 1399.00,
      baseSku: "APL-16PM-512-NT",
      description: "Experience the peak of mobile engineering. Built with a solid, lightweight Grade 5 titanium frame and larger 6.9-inch screen. Powered by the hyper-efficient A18 Pro chip with the next-gen Neural Engine for flawless performance, featuring the direct tactile Camera Control slider pad.",
      img: "https://images.unsplash.com/photo-1611791485938-1a2a43b44b82?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Samsung Galaxy S25 Ultra 5G (512GB, Titanium Silver)",
      price: 1299.00,
      baseSku: "SAM-S25U-512-TS",
      description: "The absolute zenith of Android mobile systems. Constructed with a grade 5 titanium frame and featuring the blazing-fast Snapdragon 8 Gen 4 AI-optimized processor, flat 6.8-inch Dynamic AMOLED 2X flat display, integrated S-Pen, and 200MP camera sensor.",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "DJI Mavic 3 Pro Drone (Fly More Combo, DJI RC Pro)",
      price: 2199.00,
      baseSku: "DJI-MAVC-3PRO",
      description: "High-end aerial cinematography drone system. Sports a world-class Hasselblad primary camera with a 4/3 CMOS sensor, plus custom dual-telephoto physical focal lenses. Supports ProRes 422 recording and advanced omnidirectional mapping.",
      img: "https://images.unsplash.com/photo-1506947411108-013748888cbd?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Apple MacBook Pro 14-inch M4 Pro (1TB SSD, Space Black)",
      price: 1999.00,
      baseSku: "APL-MBP14-M4P",
      description: "Engineered for designers, developers, and creators. The Apple MacBook Pro runs on the custom-silicon M4 Pro chip with a 14-core CPU and 20-core GPU. Outfitted with Liquid Retina XDR display yielding up to 1600 nits peak luminance.",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Sony Bravia XR 75-inch Mini-LED 4K Ultra HD HDR TV",
      price: 2498.00,
      baseSku: "SNY-BRV-XR75",
      description: "Transform your home theater with cinematic full-array luminance. Embedded Cognitive Processor XR dynamically analyzes focal points to render photorealistic organic colors, deep onyx blacks, and extreme peak brightness.",
      img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Asus ROG Zephyrus G16 Gaming Laptop (OLED, RTX 4080)",
      price: 2699.00,
      baseSku: "ASU-ROG-G16-4080",
      description: "Uncompromised gaming power in a thin obsidian chassis. Powered by Intel Core Ultra 9 and NVIDIA RTX 4080 GPU, showcasing an breathtaking 2.5K 240Hz ROG Nebula OLED display for perfect responsive accuracy.",
      img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Bose QuietComfort Ultra Spatial Audio Headphones",
      price: 429.00,
      baseSku: "BSE-QC-ULTRA-BLK",
      description: "The absolute pinnacle of personal audio immersion. Integrates world-class active hybrid noise cancellation paired with Bose Immersive Audio spatial grids to construct unmatched depth and presence for audiophiles.",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Canon EOS R5 Mark II Mirrorless Camera (Body Only)",
      price: 3899.00,
      baseSku: "CAN-EOS-R5M2-BO",
      description: "The professional benchmark for elite commercial creators. Features a newly designed 45-megapixel stacked back-illuminated sensor, next-gen eye control autofocus tracking, and up to 8K RAW cinema recording.",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "LG C4 Series 65-Inch OLED evo 4K Smart TV",
      price: 1699.00,
      baseSku: "LGE-C4-OLED65-EVO",
      description: "Experience infinite contrast and self-lit pixels at their brightest. Features the custom \u03b19 AI Processor Gen7 for advanced 4K upscaling, immersive Dolby Vision settings, and AMD FreeSync Premium gaming suites.",
      img: "https://images.unsplash.com/photo-1558882224-dda166733360?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Sonos Ultimate spatial theater System",
      price: 2499.00,
      baseSku: "WEL-SONOS-ULT-SYS",
      description: "The definitive multidirectional spatial Dolby Atmos audio system. Comprising the award-winning Sonos Arc soundbar, dual Sub subwoofers, and Era 300 surround speakers emitting authentic height-reflection effects.",
      img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Apple Watch Ultra 2 (GPS + Cellular, Titanium)",
      price: 799.00,
      baseSku: "APL-WCH-ULT2-TI",
      description: "The ultimate rugged outdoor adventure device. Constructed with a 49mm aerospace-grade titanium case, ultra-bright 3000-nit Always-On Retina display, dual-frequency high-precision GPS, and up to 72 hours of battery life.",
      img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "GoPro HERO13 Black Creator Edition Action Camera",
      price: 599.00,
      baseSku: "GPR-H13-CREATOR-ED",
      description: "Everything you need to capture professional-grade, high-impact adventure videos on the fly. Offers hyper-smooth 5.3K video stabilization, integrated professional battery grip handle, multi-directional microphone, and LED lighting accessories.",
      img: "https://images.unsplash.com/photo-1565130838608-22045233fb1e?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "1",
      name: "Sennheiser HD 800 S High-Fidelity Reference Headphones",
      price: 1799.00,
      baseSku: "SNH-HD800S-REF",
      description: "The legendary open-back acoustic reference headphones. Engineered in Germany utilizing custom 56mm ring radiator transducer systems. Renders unmatched expansive soundstage presence and clean neutral frequency responses.",
      img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"
    },

    // Apparel & Luxury Fashion (Category 2)
    {
      categoryId: "2",
      name: "Burberry Heritage Kensington Mid-Length Trench Coat",
      price: 2490.00,
      baseSku: "BUR-KENS-TRN",
      description: "Topped with detailed horn buttons and a legacy check-lined drape, defining generations of signature outdoor wear. Made in Castleford, England, using weather-resistant and breathable cotton gabardine weave.",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Canada Goose Men's Expedition Winter Cold Parka Jacket",
      price: 1495.00,
      baseSku: "CAN-EXP-PRK",
      description: "Developed for researchers at McMurdo Station in Antarctica. Employs water-resistant Arctic Tech fabric, abundant utility pocketing, and deep premium down fill designed to survive deep arctic conditions down to -30°C.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Loro Piana Road Connection Baby Cashmere Full-Zip Jacket",
      price: 3850.00,
      baseSku: "LOR-PCM-ZIP",
      description: "Exquisite Italian luxury. Sourced from organic, long-staple baby cashmere undercoats in Inner Mongolia for perfect weightless insulation, paired with hand-finished goatskin suede trim accents.",
      img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Moncler Maya Classic Hooded Short Down Puffer Jacket",
      price: 1650.00,
      baseSku: "MON-MAY-PFR",
      description: "Iconic alpine streetwear. High-gloss water-resistant laqué exterior stuffed with superior grade goose feather down. Features a detachable protective hood, signature sleeve patch pocket, and heavy dual-zip front.",
      img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Shinola The Runwell Automatic 47mm Watch",
      price: 1150.00,
      baseSku: "SHI-RUN-AUTO",
      description: "Detroit signature timepiece showcasing Swiss Ronda automatic caliber movement. Crafted with a stunning curved sapphire window, robust 47mm polished steel case, and premium raw hand-stitched Horween leather strap.",
      img: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Omega Speedmaster Professional Moonwatch Chronograph",
      price: 3800.00,
      baseSku: "OMG-MOON-WATCH",
      description: "A legendary horological icon authorized for all NASA manned space missions. Showcases the manually-wound caliber 3861 coaxial escapement movement, protected inside a robust 42mm brushed and polished steel casing.",
      img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Saint Laurent Classic Motorcycle Leather Jacket",
      price: 3150.00,
      baseSku: "YSL-MTC-CYCLE",
      description: "The quintessential French rock-and-roll aesthetic. Expertly handcrafted in Italy using ultra-supple selected calfskin leather, detailed with polished heavy steel asymmetrical front zippers and button-down collar folds.",
      img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Red Wing Heritage Iron Ranger 6-Inch Leather Boots",
      price: 349.00,
      baseSku: "RDW-RNG-06",
      description: "Historic heavy duty military-grade utility boots styled with speed hooks and a double-layer leather toe cap. Constructed using rugged copper rough-and-tough leather stitched to durable Goodyear-welted rubber soles.",
      img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Hermēs Leather Collier de Chien Premium Bracelet",
      price: 1250.00,
      baseSku: "HER-CDC-EPSOM",
      description: "A supreme leather fashion accessory highlighting bold French architectural lines. Features a thick band of premium Epsom leather lined with signature gleaming gold-brass metal pyramid studs and ring toggles.",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Gucci GG Marmont Small Shoulder Bag",
      price: 2590.00,
      baseSku: "GUC-MARMONT",
      description: "A signature statement of high-fashion luxury. Expertly crafted in Italy using beautiful matelassē chevron quilted leather, highlighted by retro-styled double-G interlocking gold hardware on the front fold.",
      img: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a630?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Prada Re-Nylon Light Padded Technical Shell Jacket",
      price: 1850.00,
      baseSku: "PRD-NYL-SHELL",
      description: "A minimalist blend of outdoor utility and Milanese couture. Handcrafted utilizing sustainable ocean-reclaimed recycled technical fibers, lined with warming micro-layers and crowned with Prada's classic metal triangle logo.",
      img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Balenciaga Triple S Clear Sole Premium Sneakers",
      price: 1100.00,
      baseSku: "BAL-TRIP-S",
      description: "The definitive high-end streetwear icon that pioneered the structural chunky sneaker trend. Outfitted with heavy-duty layered mesh panels, textured nubuck detailing, and complex triple-stacked clear translucent outsoles.",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "2",
      name: "Bottega Veneta Intrecciato Bi-Fold Leather Wallet",
      price: 620.00,
      baseSku: "BOT-VNT-INTREC",
      description: "A quiet luxury essential. Constructed without external logos, utilizing Bottega Veneta's signature hand-woven Intrecciato leather ribbon grids in supple calfskin, containing multiple structured internal slots.",
      img: "https://images.unsplash.com/photo-1627124212889-74d4ad2224aff?auto=format&fit=crop&w=600&q=80"
    },

    // Furniture & Living (Category 3)
    {
      categoryId: "3",
      name: "Herman Miller Aeron Ergonomic Office Chair (Mineral)",
      price: 1895.00,
      baseSku: "HML-AER-MIN",
      description: "Ergonomic seating redesigned for ultimate back-office safety. Employs custom Pellicle 8Z mesh with eight zones of varying tension. Equipped with PostureFit SL lumbar pads and fully-adjustable soft vinyl arm pads.",
      img: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Eames Classic Lounge Chair and Ottoman in Premium Walnut",
      price: 3495.00,
      baseSku: "EAM-LNC-WLN",
      description: "The definitive landmark of modern furniture design. Features beautiful, hand-finished walnut wood veneers paired with buttery soft premium black grain leather. Features the classic swivel base and timeless mid-century aesthetic.",
      img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Thuma The Bed Solid Walnut Platform Bed Frame",
      price: 1095.00,
      baseSku: "THM-BED-WLN",
      description: "Solid kiln-dried walnut wood panels that lock together securely using clean corner Japanese Castle Joints with zero metal screws or tools. Includes a soft cushioned headboard background.",
      img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Timothy Oulton Kensington Tufted Chesterfield Leather Sofa",
      price: 3800.00,
      baseSku: "TIM-KNS-CHV",
      description: "Majestic, deeply-tufted Chesterfield sofa wrapped in thick, hand-distressed tobacco brown leather. Hand-driven gold-brass upholstery tacks, solid kiln-dried birch wood frame, and pocket coil suspension structure.",
      img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "West Elm Haven Modular Sectional Sofa",
      price: 2299.00,
      baseSku: "WEL-HAV-LIN",
      description: "Conformable deep modular lounge sectional with contract-grade corner-blocked solid wood frame. Features generous deep seating filled with custom feather-down blends and Stone Gray Belgian linen fabric.",
      img: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Restoration Hardware St. James Open-Shelf Storage Desk",
      price: 2495.00,
      baseSku: "RHD-ST-JAMES",
      description: "An grand architectural executive style desk handcrafted of solid distressed oak timbers. Showcases hand-carved corbel accents, double-shelved matching drawers, and custom-hammered pewter metal drop handles.",
      img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Noguchi Triangular Glass Top Coffee Table (Solid Oak)",
      price: 989.00,
      baseSku: "NGI-COFFEE-TBL",
      description: "The organic, museum-grade living room centerpiece designed by legendary Isamu Noguchi. Formed by a thick, polished 3/4-inch tempered glass plate sitting atop nested interlocked solid black oak wooden support bases.",
      img: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Knoll Womb Chair and Ottoman in Cashmere Blend",
      price: 3100.00,
      baseSku: "KNL-WOMB-CHR",
      description: "The ultra-comfortable landmark lounge chair designed by Eero Saarinen. Wrapped inside premium heather gray cashmere wool blends over a molded reinforced fiberglass shell, complete with polished steel tripod bases.",
      img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Herman Miller Nelson Bubble Pendant Saucer Light",
      price: 495.00,
      baseSku: "HML-NLS-BUBBLE",
      description: "A soft visual glow designed by George Nelson. Showcases an organic saucer-like steel wire cage structure spray-coated with a semi-translucent textured polymer webbing to cast ambient glare-free illumination.",
      img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Ethnicraft Bok Solid Oak Dining Living Room Table",
      price: 1659.00,
      baseSku: "ETH-BOK-TBL",
      description: "A pure mid-century Scandinavian focal masterpiece. Crafted entirely of responsibly-sourced solid oak, exhibiting organic tapered structural legs and a hand-polished matte finish with durable oil treatments.",
      img: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "CB2 Gwyneth Boucle Loveseat Lounge Sofa",
      price: 1399.00,
      baseSku: "CB2-GWY-SFA",
      description: "A visually gorgeous curve with cloud-like textures. Highlighted with chunky, ultra-soft white boucle fabric upholstery over high-resiliency dense foam cores, set on a hidden recessed wooden rotation base.",
      img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "3",
      name: "Pottery Barn Benchwright Farmhouse Rustic Dining Bench",
      price: 699.00,
      baseSku: "PBN-BENCHWRIGHT",
      description: "A bold, beautiful industrial dining seating piece. Constructed utilizing thick joists of kiln-dried pine timbers, featuring heavy exposed industrial iron bolt accents and hand-applied multi-step natural stains.",
      img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80"
    },

    // Home Decoration & Accents (Category 4)
    {
      categoryId: "4",
      name: "Baccarat Eye Amber Hand-Blown Lead Crystal Vase",
      price: 1340.00,
      baseSku: "BAC-EYE-AMB",
      description: "Exquisite geometric art piece. Features masterfully hand-blown double-cut amber lead crystal glass. The horizontal exterior cuts and vertical interior cuts reflect light in spectacular multi-directional amber gradients.",
      img: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Jo Malone London Wild Bluebell Luxury Giant Candle (2.1kg)",
      price: 540.00,
      baseSku: "JOM-WLD-BLU",
      description: "A gorgeous premium olfactory atmosphere. Giant four-wick luxury scented candle hand-poured in London. Delivers delicate woodland notes of bluebell offset by persimmon and white musk. Housed in a custom cream ceramic jar.",
      img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Jonathan Adler Muse Porcelain & Polished Brass Candelabra",
      price: 495.00,
      baseSku: "JON-MUS-CND",
      description: "Surrealist, beautiful centerpiece styled with Jonathan Adler's signature relief faces. Features high-fired unglazed matte porcelain bowls offset by hand-polished, gleaming golden brass active candle holders.",
      img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier",
      price: 849.00,
      baseSku: "DYS-HP09-PUR",
      description: "Ensure complete healthy air in your living spaces. Purifier completely seals in particles using advanced HEPA H13 physical filtration standards. Continuously measures and analyzes room air quality, alerts you on dynamic LCD panels.",
      img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Pendleton Yakima 100% Virgin Wool Camp Blanket",
      price: 289.00,
      baseSku: "PEN-YAK-WOL",
      description: "Rustic full-sized wool throw woven in historic Oregon mills. Heritage blankets modeled after standard elements used by early American shepherds. Woven with organic thick virgin wool and strong cotton warp fibers.",
      img: "https://images.unsplash.com/photo-1600121848594-d8644e57abad?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Philips Saeco Xelsis Deluxe Automatic Espresso Machine",
      price: 2199.00,
      baseSku: "PHI-XELSIS-DLX",
      description: "Indulge in barista-quality custom hot coffee beverages from a single gorgeous machine. Highlights an interactive color touchscreen displaying up to 22 configurable beverage recipes, built with high-quality ceramic mills.",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Breville the Oracle Touch Fully Automatic Coffee Machine",
      price: 2699.00,
      baseSku: "BRV-ORACLE-TCH",
      description: "The absolute premium master class in home espresso setups. Automatically grinds, doses, and tamps high-quality espresso coffee, accompanied by a self-cleaning professional steam wand that textures silky milk foam.",
      img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Assouline Ultimate Collection Luxury Book Set (3 Volume)",
      price: 1200.00,
      baseSku: "ASL-ULTIMATE-V3",
      description: "A gorgeous, high-end visual luxury centerpiece for the modern coffee table. Comprising three magnificent, giant-format hand-bound volumes showcasing art, master travel photography, and exquisite design histories.",
      img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Vitamix A3500 Ascent Series Smart Professional Blender",
      price: 649.00,
      baseSku: "VTX-ASC-A3500",
      description: "The ultimate culinary power workstation used by commercial chefs worldwide. Programmed with 5 smart presets, automatic container size sensing, and rugged custom laser-cut heavy steel physical blades.",
      img: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Rinnai Premium Residential Grade Smart Tankless Water Heater",
      price: 1499.00,
      baseSku: "RNI-TANKLESS-HYB",
      description: "An incredibly efficient premium appliance delivering endless home-wide hot water on demand. Equipped with integrated Wi-Fi monitoring sensors, smart home integration, and highly durable double copper heat exchangers.",
      img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Lalique Anemone Hand-Crafted Clear & Satin Glass Figurine",
      price: 790.00,
      baseSku: "LLQ-ANEMONE",
      description: "An exquisite French crystal creation originally conceived by legendary artist René Lalique in 1912. Expertly hand-blown clear and satin-polished glass crystal flower highlighting beautiful onyx enamel center folds.",
      img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80"
    },
    {
      categoryId: "4",
      name: "Balmuda The Toaster Steam Oven (Special Limited Edition)",
      price: 329.00,
      baseSku: "BMD-STEAM-TOAST",
      description: "The acclaimed Japanese countertop steam oven. Uses state-of-the-art steam heating technology alongside micro-managed heating grids to lock in inside moisture while rendering a perfect golden exterior crust.",
      img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const productsList: any[] = [];

  const reviewTemplates = [
    {
      reviewerName: "Alexander Vance",
      title: "Absolute masterclass in craftsmanship",
      comment: "This is a masterpiece. It took me some time to pull the trigger due to the premium price tag, but holding and using it makes everything clear. Absolutely worth every single penny.",
      rating: 5
    },
    {
      reviewerName: "Sophia Sterling",
      title: "Exceeded my high expectations!",
      comment: "This product feels heavy, robust, and performs beautifully. I've been shopping on premium marketplaces for years and this matches or exceeds top-tier couture. Five stars all around.",
      rating: 5
    },
    {
      reviewerName: "Dr. Marcus Chen",
      title: "Phenomenal build, minor freight delay",
      comment: "A magnificent item. The design is spectacular and materials are ultra-luxurious. Deducting one star because delivery took an extra day, but product itself is flawless.",
      rating: 4
    },
    {
      reviewerName: "Isabella Rossi",
      title: "Magnifique!",
      comment: "Stunning craftsmanship and unbelievable attention to detail. This was packed in structured heavy custom crates. This company takes luxury seriously. I will definitely buy again.",
      rating: 5
    },
    {
      reviewerName: "Liam Gallagher",
      title: "Real high-end caliber",
      comment: "Unbelievable fidelity. It screams top shelf from the moment you unpack the seal. If you want a cheap plasticky alternative go to a budget outlet; this is for serious appreciators.",
      rating: 5
    },
    {
      reviewerName: "Zara Patel",
      title: "Extremely pleased with the luxury feel",
      comment: "Beautiful aesthetics, and perfectly functional. The documentation and certificate of authenticity included are a wonderful, reassuring touch.",
      rating: 4
    }
  ];

  function getPreseededReviews(prodId: string, seedOffset: number) {
    const reviews: any[] = [];
    const count = 3 + (seedOffset % 3); // 3 to 5 reviews per item
    for (let r = 0; r < count; r++) {
      const tempIdx = (seedOffset * 7 + r * 13) % reviewTemplates.length;
      const t = reviewTemplates[tempIdx];
      const daysAgo = 2 + r * 5 + (seedOffset % 10);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      reviews.push({
        id: `rev-seed-${prodId}-${r}`,
        reviewerName: t.reviewerName,
        rating: t.rating,
        title: t.title,
        comment: t.comment,
        createdAt: date
      });
    }
    return reviews;
  }

  // Insert exactly our 20 premium physical items
  seedBases.forEach((base, index) => {
    const pId = `p-seed-${index + 1}`;
    productsList.push({
      id: pId,
      name: base.name,
      price: base.price,
      description: base.description,
      categoryId: base.categoryId,
      images: [base.img],
      stock: 8 + (index * 3) % 20,
      sku: `${base.baseSku}-LE`,
      reviews: getPreseededReviews(pId, index)
    });
  });

  return productsList;
}

const generatedProducts = generateProducts();

const initialDb = {
  settings: {
    paypalEmail: "merchant-billing@rare.us",
    businessName: "RARE USA",
    isEnabled: true
  }
};

const MOCK_DB_FILE = path.join(process.cwd(), "mock_db_store.json");

interface MockState {
  categories: any[];
  products: any[];
  orders: any[];
  settings: any[];
  admin: any[];
  users: any[];
}

let mockState: MockState = {
  categories: [],
  products: [],
  orders: [],
  settings: [],
  admin: [],
  users: []
};

// Seed categories if mockState is empty
function loadMockState() {
  try {
    if (fs.existsSync(MOCK_DB_FILE)) {
      const contents = fs.readFileSync(MOCK_DB_FILE, "utf-8");
      mockState = JSON.parse(contents);
      console.log("Mock PostgreSQL database state successfully loaded from:", MOCK_DB_FILE);
      if (!mockState.products || mockState.products.length === 0) {
        mockState.products = [...generatedProducts];
        saveMockState();
      }
    } else {
      console.log("Initializing dynamic mock PostgreSQL database state fallback...");
      mockState.categories = [...seedCategories];
      mockState.products = [...generatedProducts];
      mockState.settings = [{
        paypalemail: initialDb.settings.paypalEmail,
        businessname: initialDb.settings.businessName,
        isenabled: initialDb.settings.isEnabled
      }];
      mockState.admin = [{
        username: "Maidul",
        passwordhash: "c59f2097511f21592af4a5b59394c2b65c117bc4cf2cbd336142e4be11fce7c7"
      }];
      mockState.orders = [];
      mockState.users = [];
      saveMockState();
    }
  } catch (err) {
    console.error("Error loading mockState:", err);
  }
}

function saveMockState() {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(mockState, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving mockState:", err);
  }
}

loadMockState();

async function mockDbQuery(text: string, params: any[] = []): Promise<{ rows: any[] }> {
  const sqlNormalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  
  if (sqlNormalized.includes("create table")) {
    return { rows: [] };
  }

  if (sqlNormalized.includes("count(*) as count from categories")) {
    return { rows: [{ count: String(mockState.categories.length) }] };
  }

  if (sqlNormalized.includes("count(*) as count from products")) {
    return { rows: [{ count: String(mockState.products.length) }] };
  }

  if (sqlNormalized.includes("count(*) as count from settings")) {
    return { rows: [{ count: String(mockState.settings.length) }] };
  }

  if (sqlNormalized.includes("count(*) as count from admin")) {
    return { rows: [{ count: String(mockState.admin.length) }] };
  }

  // Categories
  if (sqlNormalized.includes("select * from categories order by id asc") || sqlNormalized === "select * from categories") {
    const sorted = [...mockState.categories].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return { rows: sorted };
  }

  if (sqlNormalized.startsWith("insert into categories")) {
    const [id, name, slug] = params;
    mockState.categories.push({ id: String(id), name, slug });
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.includes("select * from categories where id =")) {
    const id = String(params[0]);
    const matches = mockState.categories.filter(c => String(c.id) === id);
    return { rows: matches };
  }

  if (sqlNormalized.startsWith("update categories set name =")) {
    const [name, slug, id] = params;
    const cat = mockState.categories.find(c => String(c.id) === String(id));
    if (cat) {
      cat.name = name;
      cat.slug = slug;
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("delete from categories where id =")) {
    const id = String(params[0]);
    mockState.categories = mockState.categories.filter(c => String(c.id) !== id);
    saveMockState();
    return { rows: [] };
  }

  // Products Category ID cleanup
  if (sqlNormalized.includes("update products set categoryid = '' where categoryid =")) {
    const catId = String(params[0]);
    mockState.products.forEach(p => {
      if (String(p.categoryid) === catId) {
        p.categoryid = "";
      }
    });
    saveMockState();
    return { rows: [] };
  }

  // Products
  if (sqlNormalized.includes("select * from products order by id asc") || sqlNormalized === "select * from products") {
    const sorted = [...mockState.products].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return { rows: sorted };
  }

  if (sqlNormalized.startsWith("insert into products")) {
    const [id, categoryid, name, price, description, images, stock, sku, reviews] = params;
    mockState.products.push({
      id: String(id),
      categoryid: String(categoryid),
      name,
      price: Number(price),
      description,
      images,
      stock: Number(stock),
      sku,
      reviews
    });
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.includes("select * from products where id =")) {
    const id = String(params[0]);
    const matches = mockState.products.filter(p => String(p.id) === id);
    return { rows: matches };
  }

  if (sqlNormalized.startsWith("update products set reviews =")) {
    const [reviews, id] = params;
    const prod = mockState.products.find(p => String(p.id) === String(id));
    if (prod) {
      prod.reviews = reviews;
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("update products set")) {
    const [name, price, description, categoryid, images, stock, sku, id] = params;
    const prod = mockState.products.find(p => String(p.id) === String(id));
    if (prod) {
      prod.name = name;
      prod.price = Number(price);
      prod.description = description;
      prod.categoryid = String(categoryid);
      prod.images = images;
      prod.stock = Number(stock);
      prod.sku = sku;
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("delete from products where id =")) {
    const id = String(params[0]);
    mockState.products = mockState.products.filter(p => String(p.id) !== id);
    saveMockState();
    return { rows: [] };
  }

  // Orders
  if (sqlNormalized.includes("select * from orders order by createdat desc") || sqlNormalized.includes("select * from orders")) {
    const sorted = [...mockState.orders].sort((a, b) => Number(b.createdat) - Number(a.createdat));
    return { rows: sorted };
  }

  if (sqlNormalized.startsWith("insert into orders")) {
    const [id, customer, items, subtotal, tax, shipping, total, createdat, method, originalTotal, discountAmount, userId] = params;
    mockState.orders.push({
      id: String(id),
      customer,
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      shipping: Number(shipping),
      total: Number(total),
      status: "Pending",
      paypaltransactionid: "",
      amountpaid: 0,
      paymentscreenshot: "",
      createdat: Number(createdat),
      paymentMethod: method || "card",
      originalTotal: originalTotal !== undefined ? Number(originalTotal) : Number(total),
      discountAmount: discountAmount !== undefined ? Number(discountAmount) : 0,
      userId: userId || null
    });
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.includes("select * from orders where id =")) {
    const id = String(params[0]).trim();
    const matches = mockState.orders.filter(o => {
      const oid = String(o.id).trim();
      const cleanOid = oid.replace(/ORD-/gi, "").toUpperCase();
      const cleanId = id.replace(/ORD-/gi, "").toUpperCase();
      return oid === id || oid.toUpperCase() === id.toUpperCase() || cleanOid === cleanId;
    });
    return { rows: matches };
  }

  if (sqlNormalized.includes("update orders set paypaltransactionid =") || sqlNormalized.includes("update orders set paypaltransactionid")) {
    const [paypaltransactionid, amountpaid, paymentscreenshot, idVal] = params;
    const id = String(idVal).trim();
    const order = mockState.orders.find(o => {
      const oid = String(o.id).trim();
      const cleanOid = oid.replace(/ORD-/gi, "").toUpperCase();
      const cleanId = id.replace(/ORD-/gi, "").toUpperCase();
      return oid === id || oid.toUpperCase() === id.toUpperCase() || cleanOid === cleanId;
    });
    if (order) {
      order.paypaltransactionid = paypaltransactionid;
      order.amountpaid = Number(amountpaid);
      order.paymentscreenshot = paymentscreenshot;
      order.status = "Waiting For Verification";
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("update orders set status =")) {
    const [status, idVal] = params;
    const id = String(idVal).trim();
    const order = mockState.orders.find(o => {
      const oid = String(o.id).trim();
      const cleanOid = oid.replace(/ORD-/gi, "").toUpperCase();
      const cleanId = id.replace(/ORD-/gi, "").toUpperCase();
      return oid === id || oid.toUpperCase() === id.toUpperCase() || cleanOid === cleanId;
    });
    if (order) {
      order.status = status;
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("delete from orders where id =") || sqlNormalized.includes("delete from orders")) {
    const id = String(params[0]).trim();
    mockState.orders = mockState.orders.filter(o => {
      const oid = String(o.id).trim();
      const cleanOid = oid.replace(/ORD-/gi, "").toUpperCase();
      const cleanId = id.replace(/ORD-/gi, "").toUpperCase();
      const isMatch = oid === id || oid.toUpperCase() === id.toUpperCase() || cleanOid === cleanId;
      return !isMatch;
    });
    saveMockState();
    return { rows: [] };
  }

  // Settings
  if (sqlNormalized.includes("select * from settings limit 1") || sqlNormalized.includes("select * from settings")) {
    return { rows: mockState.settings };
  }

  if (sqlNormalized.startsWith("delete from settings")) {
    mockState.settings = [];
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("insert into settings")) {
    const [paypalEmail, businessName, isEnabled] = params;
    mockState.settings.push({
      paypalemail: paypalEmail,
      businessname: businessName,
      isenabled: !!isEnabled
    });
    saveMockState();
    return { rows: [] };
  }

  // Admin
  if (sqlNormalized.includes("select * from admin where username =")) {
    const username = String(params[0]);
    const matches = mockState.admin.filter(a => String(a.username).toLowerCase() === username.toLowerCase());
    return { rows: matches };
  }

  if (sqlNormalized.startsWith("insert into admin")) {
    const [username, passwordhash] = params;
    mockState.admin.push({ username, passwordhash });
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("update admin set passwordhash =")) {
    const [passwordhash, username] = params;
    const adminUser = mockState.admin.find(a => String(a.username).toLowerCase() === String(username).toLowerCase());
    if (adminUser) {
      adminUser.passwordhash = passwordhash;
      saveMockState();
    }
    return { rows: [] };
  }

  // Users Support
  if (sqlNormalized.startsWith("insert into users")) {
    const [id, email, passwordHash, fullName, phone, address, city, state, zipCode, country, wishlist] = params;
    mockState.users.push({
      id: String(id),
      email: String(email).toLowerCase().trim(),
      passwordhash: passwordHash,
      fullname: fullName || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      zipcode: zipCode || "",
      zipCode: zipCode || "",
      country: country || "",
      wishlist: wishlist || "[]",
      createdat: new Date().toISOString()
    });
    saveMockState();
    return { rows: [] };
  }

  if (sqlNormalized.includes("select * from users where email =")) {
    const email = String(params[0]).toLowerCase().trim();
    const matches = mockState.users.filter(u => String(u.email).toLowerCase().trim() === email);
    return { rows: matches };
  }

  if (sqlNormalized.includes("select * from users where id =")) {
    const id = String(params[0]);
    const matches = mockState.users.filter(u => String(u.id) === id);
    return { rows: matches };
  }

  if (sqlNormalized.startsWith("update users set") && sqlNormalized.includes("wishlist =")) {
    const [wishlist, id] = params;
    const user = mockState.users.find(u => String(u.id) === String(id));
    if (user) {
      user.wishlist = wishlist || "[]";
      saveMockState();
    }
    return { rows: [] };
  }

  if (sqlNormalized.startsWith("update users set") && sqlNormalized.includes("fullname =")) {
    const [fullName, phone, address, city, state, zipCode, country, id] = params;
    const user = mockState.users.find(u => String(u.id) === String(id));
    if (user) {
      user.fullname = fullName;
      user.phone = phone;
      user.address = address;
      user.city = city;
      user.state = state;
      user.zipCode = zipCode;
      user.zipcode = zipCode;
      user.country = country;
      saveMockState();
    }
    return { rows: [] };
  }

  // Users default list fallback
  if (sqlNormalized.includes("select * from users")) {
    return { rows: mockState.users };
  }

  return { rows: [] };
}

// Connect to secure PostgreSQL Client Pool
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("CRITICAL DATABASE ERROR: DATABASE_URL environment variable is required but is missing! Please set DATABASE_URL in your `.env` file or configuration panel.");
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("render.com") || dbUrl.includes("neon.tech") || process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function dbQuery(text: string, params?: any[]) {
  return await pool.query(text, params);
}

// Automatic database initialization (Table creations & Seed insertions)
async function initializePostgres() {
  try {
    console.log("Checking and compiling PostgreSQL backend database schema state...");


    await dbQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL
      );
    `);

    await dbQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        categoryId VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        description TEXT NOT NULL,
        images TEXT NOT NULL,
        stock INTEGER NOT NULL,
        sku VARCHAR(255) NOT NULL,
        reviews TEXT NOT NULL
      );
    `);

    await dbQuery(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer TEXT NOT NULL,
        items TEXT NOT NULL,
        subtotal DOUBLE PRECISION NOT NULL,
        tax DOUBLE PRECISION NOT NULL,
        shipping DOUBLE PRECISION NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        status VARCHAR(255) NOT NULL,
        payPalTransactionId VARCHAR(255),
        amountPaid DOUBLE PRECISION,
        paymentScreenshot TEXT,
        createdAt BIGINT NOT NULL,
        "paymentStatus" VARCHAR(255) DEFAULT 'Pending'
      );
    `);

    await dbQuery(`DROP TABLE IF EXISTS payment_logs;`);

    await dbQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        paypalEmail VARCHAR(255) PRIMARY KEY,
        businessName VARCHAR(255) NOT NULL,
        isEnabled BOOLEAN NOT NULL
      );
    `);

    await dbQuery(`
      CREATE TABLE IF NOT EXISTS admin (
        username VARCHAR(255) PRIMARY KEY,
        passwordHash VARCHAR(255) NOT NULL
      );
    `);

    await dbQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        fullName VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        "zipCode" VARCHAR(255),
        country VARCHAR(255),
        wishlist TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(255);`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "zipCode" VARCHAR(255);`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(255);`);
      await dbQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wishlist TEXT;`);
    } catch (alterErr: any) {
      console.warn("User table alteration check complete (some columns may already exist):", alterErr.message);
    }

    try {
      await dbQuery(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(255) DEFAULT 'paypal';`);
      await dbQuery(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "originalTotal" DOUBLE PRECISION;`);
      await dbQuery(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION;`);
      await dbQuery(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "userId" VARCHAR(255);`);
      await dbQuery(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(255) DEFAULT 'Pending';`);
    } catch (alterErr: any) {
      console.warn("Orders table payment alteration check complete:", alterErr.message);
    }

    try {
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobileWalletEnabled BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobileWalletInfo TEXT DEFAULT 'bKash / Nagad Wallet: +8801711112222';`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobileWalletDiscount DOUBLE PRECISION DEFAULT 15.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "mobileWalletMessage" TEXT DEFAULT '';`);
      
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS zelleEnabled BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS zelleInfo TEXT DEFAULT 'Zelle Transfer Email: payzelle@example.com (Recipient: Store Merchant)';`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS zelleDiscount DOUBLE PRECISION DEFAULT 8.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "zelleMessage" TEXT DEFAULT '';`);
      
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS payoneerEnabled BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS payoneerInfo TEXT DEFAULT 'Payoneer Balance Transfer Email: payoneer@example.com';`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS payoneerDiscount DOUBLE PRECISION DEFAULT 0.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "payoneerMessage" TEXT DEFAULT '';`);
      
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS paypalEnabled BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS paypalInfo TEXT DEFAULT 'PayPal Merchant Account: sales@example.com';`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS paypalDiscount DOUBLE PRECISION DEFAULT 0.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "paypalMessage" TEXT DEFAULT '';`);
      
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS cardEnabled BOOLEAN DEFAULT false;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "ukExchangeRate" DOUBLE PRECISION DEFAULT 0.79;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "ukTaxRate" DOUBLE PRECISION DEFAULT 12.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "ukAdjustmentPercent" DOUBLE PRECISION DEFAULT 0.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "usaTaxRate" DOUBLE PRECISION DEFAULT 8.0;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "taxEnabled" BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "taxLabel" VARCHAR(255) DEFAULT 'Tax';`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "mobileWalletDiscountEnabled" BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "zelleDiscountEnabled" BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "payoneerDiscountEnabled" BOOLEAN DEFAULT true;`);
      await dbQuery(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "paypalDiscountEnabled" BOOLEAN DEFAULT true;`);
    } catch (alterErr: any) {
      console.warn("Settings table custom payment alterations check complete:", alterErr.message);
    }

    // Verify category counts
    const catCheck = await dbQuery("SELECT COUNT(*) as count FROM categories");
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log("Seeding target categories into PostgreSQL...");
      for (const cat of seedCategories) {
        await dbQuery("INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)", [cat.id, cat.name, cat.slug]);
      }
    }

    // Safe One-Time Product Seeding Check (runs only if the database is empty)
    const prodCheck = await dbQuery("SELECT COUNT(*) as count FROM products");
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      console.log("Seeding exactly 50 real-world e-commerce products into PostgreSQL database...");
      for (const prod of generatedProducts) {
        const prodImages = Array.isArray(prod.images) ? JSON.stringify(prod.images) : JSON.stringify([prod.images]);
        const prodReviews = Array.isArray(prod.reviews) ? JSON.stringify(prod.reviews) : JSON.stringify([]);
        
        await dbQuery(
          "INSERT INTO products (id, categoryId, name, price, description, images, stock, sku, reviews) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [
            prod.id,
            prod.categoryId,
            prod.name,
            Number(prod.price),
            prod.description || "",
            prodImages,
            Number(prod.stock ?? 10),
            prod.sku || `SKU-${Math.floor(Math.random() * 100000)}`,
            prodReviews
          ]
        );
      }
      console.log(`Successfully seeded ${generatedProducts.length} permanent e-commerce products!`);
    } else {
      console.log("Database products already exist. Skipping automatic product seed to prevent resetting modifications.");
    }

    // Verify config settings count
    const settingsCheck = await dbQuery("SELECT COUNT(*) as count FROM settings");
    if (parseInt(settingsCheck.rows[0].count, 10) === 0) {
      console.log("Seeding general billing settings configs...");
      await dbQuery("INSERT INTO settings (paypalEmail, businessName, isEnabled) VALUES ($1, $2, $3)", [
        initialDb.settings.paypalEmail,
        initialDb.settings.businessName,
        initialDb.settings.isEnabled
      ]);
    }

    // Verify standard back-office admin
    const adminCheck = await dbQuery("SELECT COUNT(*) as count FROM admin");
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      console.log("Seeding core back-office administrator credentials...");
      await dbQuery("INSERT INTO admin (username, passwordHash) VALUES ($1, $2)", [
        "Maidul",
        "c59f2097511f21592af4a5b59394c2b65c117bc4cf2cbd336142e4be11fce7c7" // password "Maidul123@"
      ]);
    } else {
      // Re-assert Maidul credentials on standard reboot to safe state
      await dbQuery("UPDATE admin SET passwordHash = $1 WHERE username = $2", [
        "c59f2097511f21592af4a5b59394c2b65c117bc4cf2cbd336142e4be11fce7c7",
        "Maidul"
      ]);
    }

    console.log("PostgreSQL database setup successfully initialized and verified!");
  } catch (err) {
    console.error("Database table initialization failures:", err);
  }
}

initializePostgres();

// General Parser Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Country Detection Middleware
app.use((req: any, res, next) => {
  const countryHeader = req.headers["x-country"] || req.headers["x-selected-country"];
  let country = "US";
  if (countryHeader === "UK" || countryHeader === "GB" || countryHeader?.toUpperCase() === "UNITED KINGDOM" || countryHeader === "United Kingdom") {
    country = "UK";
  } else {
    const cookies = req.headers.cookie;
    if (cookies) {
      const match = cookies.match(/selected-country=([^;]+)/);
      if (match && (match[1] === "UK" || match[1] === "GB" || match[1] === "United Kingdom")) {
        country = "UK";
      }
    }
  }
  req.selectedCountry = country;
  next();
});

// REST API Handlers

// Categories endpoints
app.get("/api/categories", async (req, res) => {
  try {
    const result = await dbQuery("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/categories failure:", err);
    res.status(500).json({ error: "Failed to fetch categories. Please verify PostgreSQL connection." });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = String(Date.now());
    await dbQuery("INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)", [id, name.trim(), slug]);
    res.status(210).json({ id, name: name.trim(), slug });
  } catch (err) {
    console.error("POST /api/categories failure:", err);
    res.status(500).json({ error: "Failed to add category." });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const catCheck = await dbQuery("SELECT * FROM categories WHERE id = $1", [id]);
    if (catCheck.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : catCheck.rows[0].slug;
    const finalName = name ? name.trim() : catCheck.rows[0].name;

    await dbQuery("UPDATE categories SET name = $1, slug = $2 WHERE id = $3", [finalName, slug, id]);
    res.json({ id, name: finalName, slug });
  } catch (err) {
    console.error("PUT /api/categories failure:", err);
    res.status(500).json({ error: "Failed to edit category details." });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const catCheck = await dbQuery("SELECT * FROM categories WHERE id = $1", [id]);
    if (catCheck.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await dbQuery("DELETE FROM categories WHERE id = $1", [id]);
    await dbQuery("UPDATE products SET categoryId = '' WHERE categoryId = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories failure:", err);
    res.status(500).json({ error: "Failed to delete category." });
  }
});

// Products endpoints
app.get("/api/products", async (req, res) => {
  try {
    const result = await dbQuery("SELECT * FROM products ORDER BY id ASC");
    const formatted = result.rows.map(p => ({
      id: p.id,
      categoryId: p.categoryid,
      name: p.name,
      price: p.price,
      description: p.description,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      stock: p.stock,
      sku: p.sku,
      reviews: typeof p.reviews === "string" ? JSON.parse(p.reviews) : p.reviews || []
    }));
    res.json(formatted);
  } catch (err) {
    console.error("GET /api/products failure:", err);
    res.status(500).json({ error: "Failed to load products." });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, price, description, categoryId, images, stock, sku } = req.body;
    if (!name || !price || isNaN(Number(price))) {
      return res.status(400).json({ error: "Name and Valid Price are required" });
    }
    const id = "p_" + Date.now();
    const prodImages = Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"];
    const prodStock = stock !== undefined ? Number(stock) : 10;
    const prodSku = sku ? sku.trim() : "SKU-" + Math.floor(Math.random() * 100000);
    const descriptionText = description ? description.trim() : "";
    const catId = categoryId || "";
    const reviewsArr: any[] = [];

    await dbQuery(`
      INSERT INTO products (id, categoryId, name, price, description, images, stock, sku, reviews)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      id,
      catId,
      name.trim(),
      Number(price),
      descriptionText,
      JSON.stringify(prodImages),
      prodStock,
      prodSku,
      JSON.stringify(reviewsArr)
    ]);

    res.status(201).json({
      id,
      categoryId: catId,
      name: name.trim(),
      price: Number(price),
      description: descriptionText,
      images: prodImages,
      stock: prodStock,
      sku: prodSku,
      reviews: reviewsArr
    });
  } catch (err) {
    console.error("POST /api/products failure:", err);
    res.status(500).json({ error: "Failed to create new product catalog item." });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId, images, stock, sku } = req.body;

    const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const prod = prodCheck.rows[0];
    const updatedName = name !== undefined ? name.trim() : prod.name;
    const updatedPrice = price !== undefined ? Number(price) : prod.price;
    const updatedDesc = description !== undefined ? description.trim() : prod.description;
    const updatedCatId = categoryId !== undefined ? categoryId : prod.categoryid;
    const updatedImages = Array.isArray(images) ? images : (typeof prod.images === "string" ? JSON.parse(prod.images) : prod.images);
    const updatedStock = stock !== undefined ? Number(stock) : prod.stock;
    const updatedSku = sku !== undefined ? sku.trim() : prod.sku;

    await dbQuery(`
      UPDATE products SET
        name = $1,
        price = $2,
        description = $3,
        categoryId = $4,
        images = $5,
        stock = $6,
        sku = $7
      WHERE id = $8
    `, [
      updatedName,
      updatedPrice,
      updatedDesc,
      updatedCatId,
      JSON.stringify(updatedImages),
      updatedStock,
      updatedSku,
      id
    ]);

    res.json({
      id,
      categoryId: updatedCatId,
      name: updatedName,
      price: updatedPrice,
      description: updatedDesc,
      images: updatedImages,
      stock: updatedStock,
      sku: updatedSku,
      reviews: typeof prod.reviews === "string" ? JSON.parse(prod.reviews) : prod.reviews || []
    });
  } catch (err) {
    console.error("PUT /api/products failure:", err);
    res.status(500).json({ error: "Failed to edit product fields." });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    await dbQuery("DELETE FROM products WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products failure:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// GET product reviews
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const prod = prodCheck.rows[0];
    res.json(typeof prod.reviews === "string" ? JSON.parse(prod.reviews) : prod.reviews || []);
  } catch (err) {
    console.error("GET product reviews failure:", err);
    res.status(500).json({ error: "Failed to load product reviews list." });
  }
});

// POST review submission to a product
app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerName, rating, title, comment } = req.body;

    if (!reviewerName || !rating || isNaN(Number(rating))) {
      return res.status(400).json({ error: "Reviewer name and star rating are required" });
    }

    const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const prod = prodCheck.rows[0];

    const reviewsArr = typeof prod.reviews === "string" ? JSON.parse(prod.reviews) : prod.reviews || [];
    const newReview = {
      id: "rev_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      reviewerName: reviewerName.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title ? title.trim() : "",
      comment: comment ? comment.trim() : "",
      createdAt: new Date().toISOString()
    };

    reviewsArr.unshift(newReview);
    await dbQuery("UPDATE products SET reviews = $1 WHERE id = $2", [JSON.stringify(reviewsArr), id]);
    res.status(201).json(newReview);
  } catch (err) {
    console.error("POST product review failure:", err);
    res.status(500).json({ error: "Failed to save client review feedback." });
  }
});

// Orders endpoints
app.get("/api/orders", async (req, res) => {
  try {
    const result = await dbQuery("SELECT * FROM orders ORDER BY createdAt DESC");
    const formatted = result.rows.map(o => ({
      id: o.id,
      userId: o.userId || o.userid || null,
      customer: typeof o.customer === "string" ? JSON.parse(o.customer) : o.customer,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      payPalTransactionId: o.paypaltransactionid,
      amountPaid: o.amountpaid,
      paymentScreenshot: o.paymentscreenshot,
      createdAt: Number(o.createdat),
      paymentMethod: o.paymentMethod || o.paymentmethod || "card",
      originalTotal: o.originalTotal !== undefined && o.originalTotal !== null ? Number(o.originalTotal) : (o.originaltotal !== undefined && o.originaltotal !== null ? Number(o.originaltotal) : o.total),
      discountAmount: o.discountAmount !== undefined && o.discountAmount !== null ? Number(o.discountAmount) : (o.discountamount !== undefined && o.discountamount !== null ? Number(o.discountamount) : 0),
      paymentStatus: o.paymentStatus || o.paymentstatus || "Pending"
    }));
    res.json(formatted);
  } catch (err) {
    console.error("GET /api/orders failure:", err);
    res.status(500).json({ error: "Failed to read commerce orders." });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer details and order items are required" });
    }

    const { fullName, email, phone, address, city, state, zipCode, country } = customer;
    if (!fullName || !email || !address || !city || !state || !zipCode || !country) {
      return res.status(400).json({ error: "Missing required checkout parameters" });
    }

    const settingsQuery = await dbQuery("SELECT * FROM settings LIMIT 1");
    const settings = settingsQuery.rows[0];

    const isUk = (req as any).selectedCountry === "UK" || country === "UK" || country === "United Kingdom" || country?.toUpperCase() === "GB";
    
    // Default country settings
    const ukExchangeRate = settings && settings.ukExchangeRate !== undefined ? Number(settings.ukExchangeRate) : (settings && settings.ukexchangeorig !== undefined ? Number(settings.ukexchangeorig) : 0.79);
    const ukTaxRate = settings && settings.ukTaxRate !== undefined ? Number(settings.ukTaxRate) : (settings && settings.uktaxrate !== undefined ? Number(settings.uktaxrate) : 12.0);
    const ukAdjustmentPercent = settings && settings.ukAdjustmentPercent !== undefined ? Number(settings.ukAdjustmentPercent) : (settings && settings.ukadjustmentpercent !== undefined ? Number(settings.ukadjustmentpercent) : 0.0);

    let orderTotal = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [cartItem.id]);
      const product = prodCheck.rows[0];
      let itemPrice = product ? product.price : cartItem.price || 0;
      
      // If UK mode, apply the exchange rate and optional adjustment markup/discount
      if (isUk) {
        let convertedPrice = itemPrice * ukExchangeRate;
        if (ukAdjustmentPercent !== 0) {
          convertedPrice = convertedPrice * (1 + ukAdjustmentPercent / 100.0);
        }
        itemPrice = Number(convertedPrice.toFixed(2));
      }

      const qty = cartItem.quantity || 1;
      orderTotal += itemPrice * qty;

      orderItems.push({
        productId: cartItem.id,
        productName: product ? product.name : cartItem.name,
        price: itemPrice,
        quantity: qty,
        sku: product ? product.sku : "N/A"
      });
    }

    const subtotal = Number(orderTotal.toFixed(2));
    
    // Backend-driven verified discount calculations
    const method = (paymentMethod || "card").toLowerCase();
    let discountPercent = 0;
    if (settings) {
      const isMobileWalletDiscountEnabled = settings.mobileWalletDiscountEnabled !== undefined ? !!settings.mobileWalletDiscountEnabled : (settings.mobilewalletdiscountenabled !== undefined ? !!settings.mobilewalletdiscountenabled : true);
      const isZelleDiscountEnabled = settings.zelleDiscountEnabled !== undefined ? !!settings.zelleDiscountEnabled : (settings.zellediscountenabled !== undefined ? !!settings.zellediscountenabled : true);
      const isPayoneerDiscountEnabled = settings.payoneerDiscountEnabled !== undefined ? !!settings.payoneerDiscountEnabled : (settings.payoneerdiscountenabled !== undefined ? !!settings.payoneerdiscountenabled : true);
      const isPaypalDiscountEnabled = settings.paypalDiscountEnabled !== undefined ? !!settings.paypalDiscountEnabled : (settings.paypaldiscountenabled !== undefined ? !!settings.paypaldiscountenabled : true);

      if (method === "wallet" && (settings.mobilewalletenabled ?? true)) {
        if (isMobileWalletDiscountEnabled) {
          discountPercent = settings.mobilewalletdiscount !== undefined ? Number(settings.mobilewalletdiscount) : 15.0;
        }
      } else if (method === "zelle" && (settings.zelleenabled ?? true)) {
        if (isZelleDiscountEnabled) {
          discountPercent = settings.zellediscount !== undefined ? Number(settings.zellediscount) : 8.0;
        }
      } else if (method === "payoneer" && (settings.payoneerenabled ?? true)) {
        if (isPayoneerDiscountEnabled) {
          discountPercent = settings.payoneerdiscount !== undefined ? Number(settings.payoneerdiscount) : 0.0;
        }
      } else if (method === "paypal" && (settings.paypalenabled ?? true)) {
        if (isPaypalDiscountEnabled) {
          discountPercent = settings.paypaldiscount !== undefined ? Number(settings.paypaldiscount) : 0.0;
        }
      }
    } else {
      if (method === "wallet") discountPercent = 15.0;
      else if (method === "zelle") discountPercent = 8.0;
    }

    const discountAmount = Number((subtotal * (discountPercent / 100.0)).toFixed(2));
    const postDiscountSubtotal = Number(Math.max(0, subtotal - discountAmount).toFixed(2));
    
    // Tax rate calculation
    const isTaxEnabled = settings ? (settings.taxEnabled !== undefined ? !!settings.taxEnabled : (settings.taxenabled !== undefined ? !!settings.taxenabled : true)) : true;
    const usaTaxRate = settings ? (settings.usaTaxRate !== undefined ? Number(settings.usaTaxRate) : (settings.usataxrate !== undefined ? Number(settings.usataxrate) : 8.0)) : 8.0;
    const taxRatePercentage = isUk ? ukTaxRate : usaTaxRate;
    const taxRate = isTaxEnabled ? (taxRatePercentage / 100.0) : 0.0;
    const tax = Number((postDiscountSubtotal * taxRate).toFixed(2));
    
    // Shipping calculation
    const standardShippingUsd = 9.99;
    const standardShipping = isUk ? Number((standardShippingUsd * ukExchangeRate).toFixed(2)) : standardShippingUsd;
    const shipping = postDiscountSubtotal > 75 ? 0 : standardShipping;
    
    const total = Number((postDiscountSubtotal + tax + shipping).toFixed(2));
    
    const totalBeforeDiscount = Number((subtotal + Number((subtotal * taxRate).toFixed(2)) + shipping).toFixed(2));

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const customerObj = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : "",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim()
    };

    // Retrieve userId if buyer is authenticated
    let authUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const verified = verifyUserToken(token);
      if (verified) {
        authUserId = verified.userId;
      }
    }

    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required to place an order. Please login or register." });
    }

    const now = Date.now();
    await dbQuery(`
      INSERT INTO orders (
        id, customer, items, subtotal, tax, shipping, total, status, 
        payPalTransactionId, amountPaid, paymentScreenshot, createdAt,
        "paymentMethod", "originalTotal", "discountAmount", "userId", "paymentStatus"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', '', 0, '', $8, $9, $10, $11, $12, 'Pending')
    `, [
      orderId,
      JSON.stringify(customerObj),
      JSON.stringify(orderItems),
      postDiscountSubtotal,
      tax,
      shipping,
      total,
      now,
      method,
      totalBeforeDiscount,
      discountAmount,
      authUserId
    ]);

    res.status(201).json({
      id: orderId,
      userId: authUserId,
      customer: customerObj,
      items: orderItems,
      subtotal: postDiscountSubtotal,
      tax,
      shipping,
      total,
      status: "Pending",
      paymentStatus: "Pending",
      payPalTransactionId: "",
      amountPaid: 0,
      paymentScreenshot: "",
      createdAt: now,
      paymentMethod: method,
      originalTotal: totalBeforeDiscount,
      discountAmount
    });
  } catch (err) {
    console.error("POST /api/orders failure:", err);
    res.status(500).json({ error: "Failed to post checkout order." });
  }
});

// Submit payments manually via dynamic screenshotted reference ID
app.put("/api/orders/:id/pay", async (req, res) => {
  try {
    const { id } = req.params;
    const { payPalTransactionId, amountPaid, paymentScreenshot } = req.body;
    if (!payPalTransactionId || payPalTransactionId.trim() === "") {
      return res.status(400).json({ error: "Payment Reference or Transaction ID is required" });
    }

    const orderCheck = await dbQuery("SELECT * FROM orders WHERE id = $1 OR UPPER(id) = UPPER($2) OR REPLACE(UPPER(id), 'ORD-', '') = UPPER($2) OR 'ORD-' || REPLACE(UPPER($2), 'ORD-', '') = UPPER(id)", [id, id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderCheck.rows[0];

    const dbAmountPaid = amountPaid !== undefined ? Number(amountPaid) : order.total;
    const dbScreenshot = paymentScreenshot !== undefined ? paymentScreenshot : "";

    // Set status to 'Pending' instead of auto-marking as Paid
    await dbQuery(`
      UPDATE orders SET
        payPalTransactionId = $1,
        amountPaid = $2,
        paymentScreenshot = $3,
        status = 'Pending',
        "paymentStatus" = 'Pending'
      WHERE id = $4
    `, [payPalTransactionId.trim(), dbAmountPaid, dbScreenshot, order.id]);

    res.json({
      id,
      customer: typeof order.customer === "string" ? JSON.parse(order.customer) : order.customer,
      items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status: "Pending",
      paymentStatus: "Pending",
      payPalTransactionId: payPalTransactionId.trim(),
      amountPaid: dbAmountPaid,
      paymentScreenshot: dbScreenshot,
      createdAt: Number(order.createdat),
      paymentMethod: order.paymentMethod
    });
  } catch (err) {
    console.error("PUT /api/orders/:id/pay failure:", err);
    res.status(500).json({ error: "Failed to associate checkout payment logs." });
  }
});

// Update verification status on order list view from back-office dashboard
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status value is required" });
    }

    const orderCheck = await dbQuery("SELECT * FROM orders WHERE id = $1 OR UPPER(id) = UPPER($2) OR REPLACE(UPPER(id), 'ORD-', '') = UPPER($2) OR 'ORD-' || REPLACE(UPPER($2), 'ORD-', '') = UPPER(id)", [id, id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderCheck.rows[0];

    const targetStatusLower = status.toLowerCase();
    let paymentStatusVal = order.paymentStatus || order.paymentstatus || "Pending";
    
    if (["paid", "processing", "shipped", "delivered", "completed"].includes(targetStatusLower)) {
      paymentStatusVal = "Paid";
    } else if (["pending", "cancelled", "rejected"].includes(targetStatusLower)) {
      paymentStatusVal = "Pending";
    }

    await dbQuery(`
      UPDATE orders SET 
        status = $1,
        "paymentStatus" = $2
      WHERE id = $3
    `, [status, paymentStatusVal, order.id]);

    if (status === "Completed") {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      for (const item of items) {
        const prodCheck = await dbQuery("SELECT * FROM products WHERE id = $1", [item.productId]);
        const p = prodCheck.rows[0];
        if (p) {
          const newStock = Math.max(0, p.stock - item.quantity);
          await dbQuery("UPDATE products SET stock = $1 WHERE id = $2", [newStock, item.productId]);
        }
      }
    }

    res.json({
      id,
      customer: typeof order.customer === "string" ? JSON.parse(order.customer) : order.customer,
      items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status,
      paymentStatus: paymentStatusVal,
      payPalTransactionId: order.paypaltransactionid,
      amountPaid: order.amountpaid,
      paymentScreenshot: order.paymentscreenshot,
      createdAt: Number(order.createdat),
      paymentMethod: order.paymentMethod
    });
  } catch (err) {
    console.error("PUT /api/orders/:id/status failure:", err);
    res.status(500).json({ error: "Failed to update internal order state." });
  }
});

// Delete an order permanently from the back-office dashboard
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orderCheck = await dbQuery("SELECT * FROM orders WHERE id = $1 OR UPPER(id) = UPPER($2) OR REPLACE(UPPER(id), 'ORD-', '') = UPPER($2) OR 'ORD-' || REPLACE(UPPER($2), 'ORD-', '') = UPPER(id)", [id, id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderCheck.rows[0];
    await dbQuery("DELETE FROM orders WHERE id = $1", [order.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/orders failure:", err);
    res.status(500).json({ error: "Failed to delete order permanently." });
  }
});

// Commission merchant configurations
app.get("/api/settings", async (req, res) => {
  try {
    const settingsQuery = await dbQuery("SELECT * FROM settings LIMIT 1");
    const settings = settingsQuery.rows[0];
    if (!settings) {
      return res.json({
        paypalEmail: "",
        businessName: "RARE USA",
        isEnabled: true,
        mobileWalletEnabled: true,
        mobileWalletInfo: "bKash / Nagad Wallet: +8801711112222",
        mobileWalletDiscount: 15.0,
        mobileWalletMessage: "",
        zelleEnabled: true,
        zelleInfo: "Zelle Transfer Email: payzelle@example.com (Recipient: Store Merchant)",
        zelleDiscount: 8.0,
        zelleMessage: "",
        payoneerEnabled: true,
        payoneerInfo: "Payoneer Balance Transfer Email: payoneer@example.com",
        payoneerDiscount: 0.0,
        payoneerMessage: "",
        paypalEnabled: true,
        paypalInfo: "PayPal Merchant Account: sales@example.com",
        paypalDiscount: 0.0,
        paypalMessage: "",
        cardEnabled: false,
        ukExchangeRate: 0.79,
        ukTaxRate: 12.0,
        ukAdjustmentPercent: 0.0,
        usaTaxRate: 8.0,
        taxEnabled: true,
        taxLabel: "Tax",
        mobileWalletDiscountEnabled: true,
        zelleDiscountEnabled: true,
        payoneerDiscountEnabled: true,
        paypalDiscountEnabled: true
      });
    }
    res.json({
      paypalEmail: settings.paypalemail || "",
      businessName: settings.businessname || "RARE USA",
      isEnabled: settings.isenabled !== undefined ? settings.isenabled : true,
      mobileWalletEnabled: settings.mobilewalletenabled !== undefined ? settings.mobilewalletenabled : true,
      mobileWalletInfo: settings.mobilewalletinfo || "bKash / Nagad Wallet: +8801711112222",
      mobileWalletDiscount: settings.mobilewalletdiscount !== undefined ? Number(settings.mobilewalletdiscount) : 15.0,
      mobileWalletMessage: settings.mobilewalletmessage || "",
      zelleEnabled: settings.zelleenabled !== undefined ? settings.zelleenabled : true,
      zelleInfo: settings.zelleinfo || "Zelle Transfer Email: payzelle@example.com (Recipient: Store Merchant)",
      zelleDiscount: settings.zellediscount !== undefined ? Number(settings.zellediscount) : 8.0,
      zelleMessage: settings.zellemessage || "",
      payoneerEnabled: settings.payoneerenabled !== undefined ? settings.payoneerenabled : true,
      payoneerInfo: settings.payoneerinfo || "Payoneer Balance Transfer Email: payoneer@example.com",
      payoneerDiscount: settings.payoneerdiscount !== undefined ? Number(settings.payoneerdiscount) : 0.0,
      payoneerMessage: settings.payoneermessage || "",
      paypalEnabled: settings.paypalenabled !== undefined ? settings.paypalenabled : true,
      paypalInfo: settings.paypalinfo || "PayPal Merchant Account: sales@example.com",
      paypalDiscount: settings.paypaldiscount !== undefined ? Number(settings.paypaldiscount) : 0.0,
      paypalMessage: settings.paypalmessage || "",
      cardEnabled: settings.cardenabled !== undefined ? settings.cardenabled : false,
      ukExchangeRate: settings.ukExchangeRate !== undefined ? Number(settings.ukExchangeRate) : (settings.ukexchangeorig !== undefined ? Number(settings.ukexchangeorig) : 0.79),
      ukTaxRate: settings.ukTaxRate !== undefined ? Number(settings.ukTaxRate) : (settings.uktaxrate !== undefined ? Number(settings.uktaxrate) : 12.0),
      ukAdjustmentPercent: settings.ukAdjustmentPercent !== undefined ? Number(settings.ukAdjustmentPercent) : (settings.ukadjustmentpercent !== undefined ? Number(settings.ukadjustmentpercent) : 0.0),
      usaTaxRate: settings.usaTaxRate !== undefined ? Number(settings.usaTaxRate) : (settings.usataxrate !== undefined ? Number(settings.usataxrate) : 8.0),
      taxEnabled: settings.taxEnabled !== undefined ? !!settings.taxEnabled : (settings.taxenabled !== undefined ? !!settings.taxenabled : true),
      taxLabel: settings.taxLabel !== undefined ? settings.taxLabel : (settings.taxlabel !== undefined ? settings.taxlabel : "Tax"),
      mobileWalletDiscountEnabled: settings.mobileWalletDiscountEnabled !== undefined ? !!settings.mobileWalletDiscountEnabled : (settings.mobilewalletdiscountenabled !== undefined ? !!settings.mobilewalletdiscountenabled : true),
      zelleDiscountEnabled: settings.zelleDiscountEnabled !== undefined ? !!settings.zelleDiscountEnabled : (settings.zellediscountenabled !== undefined ? !!settings.zellediscountenabled : true),
      payoneerDiscountEnabled: settings.payoneerDiscountEnabled !== undefined ? !!settings.payoneerDiscountEnabled : (settings.payoneerdiscountenabled !== undefined ? !!settings.payoneerdiscountenabled : true),
      paypalDiscountEnabled: settings.paypalDiscountEnabled !== undefined ? !!settings.paypalDiscountEnabled : (settings.paypaldiscountenabled !== undefined ? !!settings.paypaldiscountenabled : true)
    });
  } catch (err) {
    console.error("GET /api/settings failure:", err);
    res.status(500).json({ error: "Failed to load merchant configs." });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const { 
      paypalEmail, businessName, isEnabled,
      mobileWalletEnabled, mobileWalletInfo, mobileWalletDiscount, mobileWalletMessage,
      zelleEnabled, zelleInfo, zelleDiscount, zelleMessage,
      payoneerEnabled, payoneerInfo, payoneerDiscount, payoneerMessage,
      paypalEnabled, paypalInfo, paypalDiscount, paypalMessage,
      cardEnabled,
      ukExchangeRate, ukTaxRate, ukAdjustmentPercent,
      usaTaxRate, taxEnabled, taxLabel,
      mobileWalletDiscountEnabled, zelleDiscountEnabled, payoneerDiscountEnabled, paypalDiscountEnabled
    } = req.body;
    
    const currentSettingsQuery = await dbQuery("SELECT * FROM settings LIMIT 1");
    const currentSettings = currentSettingsQuery.rows[0];

    const updatedEmail = paypalEmail !== undefined ? paypalEmail.trim() : (currentSettings ? currentSettings.paypalemail : "");
    const updatedName = businessName !== undefined ? businessName.trim() : (currentSettings ? currentSettings.businessname : "RARE USA");
    const updatedEnabled = isEnabled !== undefined ? !!isEnabled : (currentSettings ? currentSettings.isenabled : true);
    
    const updatedMobileWalletEnabled = mobileWalletEnabled !== undefined ? !!mobileWalletEnabled : (currentSettings?.mobilewalletenabled ?? true);
    const updatedMobileWalletInfo = mobileWalletInfo !== undefined ? mobileWalletInfo.trim() : (currentSettings?.mobilewalletinfo ?? "bKash / Nagad Wallet: +8801711112222");
    const updatedMobileWalletDiscount = mobileWalletDiscount !== undefined ? Number(mobileWalletDiscount) : (currentSettings?.mobilewalletdiscount ?? 15.0);
    const updatedMobileWalletMessage = mobileWalletMessage !== undefined ? mobileWalletMessage.trim() : (currentSettings?.mobilewalletmessage ?? "");
    
    const updatedZelleEnabled = zelleEnabled !== undefined ? !!zelleEnabled : (currentSettings?.zelleenabled ?? true);
    const updatedZelleInfo = zelleInfo !== undefined ? zelleInfo.trim() : (currentSettings?.zelleinfo ?? "Zelle Transfer Email: payzelle@example.com (Recipient: Store Merchant)");
    const updatedZelleDiscount = zelleDiscount !== undefined ? Number(zelleDiscount) : (currentSettings?.zellediscount ?? 8.0);
    const updatedZelleMessage = zelleMessage !== undefined ? zelleMessage.trim() : (currentSettings?.zellemessage ?? "");
    
    const updatedPayoneerEnabled = payoneerEnabled !== undefined ? !!payoneerEnabled : (currentSettings?.payoneerenabled ?? true);
    const updatedPayoneerInfo = payoneerInfo !== undefined ? payoneerInfo.trim() : (currentSettings?.payoneerinfo ?? "Payoneer Balance Transfer Email: payoneer@example.com");
    const updatedPayoneerDiscount = payoneerDiscount !== undefined ? Number(payoneerDiscount) : (currentSettings?.payoneerdiscount ?? 0.0);
    const updatedPayoneerMessage = payoneerMessage !== undefined ? payoneerMessage.trim() : (currentSettings?.payoneermessage ?? "");
    
    const updatedPaypalEnabled = paypalEnabled !== undefined ? !!paypalEnabled : (currentSettings?.paypalenabled ?? true);
    const updatedPaypalInfo = paypalInfo !== undefined ? paypalInfo.trim() : (currentSettings?.paypalinfo ?? "PayPal Merchant Account: sales@example.com");
    const updatedPaypalDiscount = paypalDiscount !== undefined ? Number(paypalDiscount) : (currentSettings?.paypaldiscount ?? 0.0);
    const updatedPaypalMessage = paypalMessage !== undefined ? paypalMessage.trim() : (currentSettings?.paypalmessage ?? "");
    
    const updatedCardEnabled = cardEnabled !== undefined ? !!cardEnabled : (currentSettings?.cardenabled ?? false);

    const updatedUkExchangeRate = ukExchangeRate !== undefined ? Number(ukExchangeRate) : (currentSettings?.ukExchangeRate !== undefined ? Number(currentSettings.ukExchangeRate) : (currentSettings?.ukexchangerate !== undefined ? Number(currentSettings.ukexchangerate) : 0.79));
    const updatedUkTaxRate = ukTaxRate !== undefined ? Number(ukTaxRate) : (currentSettings?.ukTaxRate !== undefined ? Number(currentSettings.ukTaxRate) : (currentSettings?.uktaxrate !== undefined ? Number(currentSettings.uktaxrate) : 12.0));
    const updatedUkAdjustmentPercent = ukAdjustmentPercent !== undefined ? Number(ukAdjustmentPercent) : (currentSettings?.ukAdjustmentPercent !== undefined ? Number(currentSettings.ukAdjustmentPercent) : (currentSettings?.ukadjustmentpercent !== undefined ? Number(currentSettings.ukadjustmentpercent) : 0.0));

    const updatedUsaTaxRate = usaTaxRate !== undefined ? Number(usaTaxRate) : (currentSettings?.usaTaxRate !== undefined ? Number(currentSettings.usaTaxRate) : (currentSettings?.usataxrate !== undefined ? Number(currentSettings.usataxrate) : 8.0));
    const updatedTaxEnabled = taxEnabled !== undefined ? !!taxEnabled : (currentSettings?.taxEnabled !== undefined ? !!currentSettings.taxEnabled : (currentSettings?.taxenabled !== undefined ? !!currentSettings.taxenabled : true));
    const updatedTaxLabel = taxLabel !== undefined ? taxLabel.trim() : (currentSettings?.taxLabel !== undefined ? currentSettings.taxLabel : (currentSettings?.taxlabel !== undefined ? currentSettings.taxlabel : "Tax"));

    const updatedMobileWalletDiscountEnabled = mobileWalletDiscountEnabled !== undefined ? !!mobileWalletDiscountEnabled : (currentSettings?.mobileWalletDiscountEnabled !== undefined ? !!currentSettings.mobileWalletDiscountEnabled : (currentSettings?.mobilewalletdiscountenabled !== undefined ? !!currentSettings.mobilewalletdiscountenabled : true));
    const updatedZelleDiscountEnabled = zelleDiscountEnabled !== undefined ? !!zelleDiscountEnabled : (currentSettings?.zelleDiscountEnabled !== undefined ? !!currentSettings.zelleDiscountEnabled : (currentSettings?.zellediscountenabled !== undefined ? !!currentSettings.zellediscountenabled : true));
    const updatedPayoneerDiscountEnabled = payoneerDiscountEnabled !== undefined ? !!payoneerDiscountEnabled : (currentSettings?.payoneerDiscountEnabled !== undefined ? !!currentSettings.payoneerDiscountEnabled : (currentSettings?.payoneerdiscountenabled !== undefined ? !!currentSettings.payoneerdiscountenabled : true));
    const updatedPaypalDiscountEnabled = paypalDiscountEnabled !== undefined ? !!paypalDiscountEnabled : (currentSettings?.paypalDiscountEnabled !== undefined ? !!currentSettings.paypalDiscountEnabled : (currentSettings?.paypaldiscountenabled !== undefined ? !!currentSettings.paypaldiscountenabled : true));

    await dbQuery("DELETE FROM settings");
    await dbQuery(`
      INSERT INTO settings (
        paypalEmail, businessName, isEnabled,
        mobileWalletEnabled, mobileWalletInfo, mobileWalletDiscount, "mobileWalletMessage",
        zelleEnabled, zelleInfo, zelleDiscount, "zelleMessage",
        payoneerEnabled, payoneerInfo, payoneerDiscount, "payoneerMessage",
        paypalEnabled, paypalInfo, paypalDiscount, "paypalMessage",
        cardEnabled, "ukExchangeRate", "ukTaxRate", "ukAdjustmentPercent",
        "usaTaxRate", "taxEnabled", "taxLabel",
        "mobileWalletDiscountEnabled", "zelleDiscountEnabled", "payoneerDiscountEnabled", "paypalDiscountEnabled"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
    `, [
      updatedEmail, updatedName, updatedEnabled,
      updatedMobileWalletEnabled, updatedMobileWalletInfo, updatedMobileWalletDiscount, updatedMobileWalletMessage,
      updatedZelleEnabled, updatedZelleInfo, updatedZelleDiscount, updatedZelleMessage,
      updatedPayoneerEnabled, updatedPayoneerInfo, updatedPayoneerDiscount, updatedPayoneerMessage,
      updatedPaypalEnabled, updatedPaypalInfo, updatedPaypalDiscount, updatedPaypalMessage,
      updatedCardEnabled, updatedUkExchangeRate, updatedUkTaxRate, updatedUkAdjustmentPercent,
      updatedUsaTaxRate, updatedTaxEnabled, updatedTaxLabel,
      updatedMobileWalletDiscountEnabled, updatedZelleDiscountEnabled, updatedPayoneerDiscountEnabled, updatedPaypalDiscountEnabled
    ]);

    res.json({
      paypalEmail: updatedEmail,
      businessName: updatedName,
      isEnabled: updatedEnabled,
      mobileWalletEnabled: updatedMobileWalletEnabled,
      mobileWalletInfo: updatedMobileWalletInfo,
      mobileWalletDiscount: updatedMobileWalletDiscount,
      mobileWalletMessage: updatedMobileWalletMessage,
      zelleEnabled: updatedZelleEnabled,
      zelleInfo: updatedZelleInfo,
      zelleDiscount: updatedZelleDiscount,
      zelleMessage: updatedZelleMessage,
      payoneerEnabled: updatedPayoneerEnabled,
      payoneerInfo: updatedPayoneerInfo,
      payoneerDiscount: updatedPayoneerDiscount,
      payoneerMessage: updatedPayoneerMessage,
      paypalEnabled: updatedPaypalEnabled,
      paypalInfo: updatedPaypalInfo,
      paypalDiscount: updatedPaypalDiscount,
      paypalMessage: updatedPaypalMessage,
      cardEnabled: updatedCardEnabled,
      ukExchangeRate: updatedUkExchangeRate,
      ukTaxRate: updatedUkTaxRate,
      ukAdjustmentPercent: updatedUkAdjustmentPercent,
      usaTaxRate: updatedUsaTaxRate,
      taxEnabled: updatedTaxEnabled,
      taxLabel: updatedTaxLabel,
      mobileWalletDiscountEnabled: updatedMobileWalletDiscountEnabled,
      zelleDiscountEnabled: updatedZelleDiscountEnabled,
      payoneerDiscountEnabled: updatedPayoneerDiscountEnabled,
      paypalDiscountEnabled: updatedPaypalDiscountEnabled
    });
  } catch (err) {
    console.error("PUT /api/settings failure:", err);
    res.status(500).json({ error: "Failed to configure paypal account parameters." });
  }
});

// Fetch payment transactions logs database records
// Administrative control authorization screen
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const hash = hashPassword(password);
    const adminCheck = await dbQuery("SELECT * FROM admin WHERE username = $1", [username]);
    const admin = adminCheck.rows[0];

    if (admin && hash === admin.passwordhash) {
      const token = crypto.randomBytes(16).toString("hex");
      return res.json({ success: true, token, username: admin.username });
    }
    res.status(401).json({ error: "Invalid administrator credentials." });
  } catch (err) {
    console.error("POST /api/admin/login failure:", err);
    res.status(500).json({ error: "Back-office login verification failed." });
  }
});

// ==========================================
// CRYPTOGRAPHICALLY SECURE BUYER SIGNUP/LOGIN & PROFILE ENDPOINTS
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || "rare-commerce-secret-2026";

function generateUserToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 });
  const base64Payload = Buffer.from(payload).toString("base64");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(base64Payload).digest("hex");
  return `${base64Payload}.${signature}`;
}

function verifyUserToken(token: string): { userId: string; email: string } | null {
  try {
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) return null;
    const computedSignature = crypto.createHmac("sha256", JWT_SECRET).update(base64Payload).digest("hex");
    if (computedSignature !== signature) return null;
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf-8"));
    if (payload.expiresAt < Date.now()) return null;
    return { userId: payload.userId, email: payload.email };
  } catch (e) {
    return null;
  }
}

async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No login session detected. Please authenticate." });
    }
    const token = authHeader.split(" ")[1];
    const verified = verifyUserToken(token);
    if (!verified) {
      return res.status(401).json({ error: "Session expired or invalid. Please sign in again." });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal session authentication pipeline error." });
  }
}

app.post("/api/users/register", async (req, res) => {
  try {
    const { email, password, fullName, phone, address, city, state, zipCode, country } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Full Name, Email and Password are required." });
    }

    // Check if email already registered
    const existsCheck = await dbQuery("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existsCheck.rows && existsCheck.rows.length > 0) {
      return res.status(400).json({ error: "This email address is already registered in our system." });
    }

    const userId = "USR-" + Math.floor(100000 + Math.random() * 900000);
    const passwordHash = hashPassword(password);
    const wishlist = "[]";

    await dbQuery(`
      INSERT INTO users (id, email, passwordHash, fullName, phone, address, city, state, "zipCode", country, wishlist)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      userId,
      email.toLowerCase().trim(),
      passwordHash,
      fullName.trim(),
      phone ? phone.trim() : "",
      address ? address.trim() : "",
      city ? city.trim() : "",
      state ? state.trim() : "",
      zipCode ? zipCode.trim() : "",
      country ? country.trim() : "",
      wishlist
    ]);

    const token = generateUserToken(userId, email.toLowerCase().trim());
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        country: country || "",
        wishlist: []
      }
    });
  } catch (err) {
    console.error("POST /api/users/register failure:", err);
    res.status(500).json({ error: "Failed to create accounts registry database row." });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const check = await dbQuery("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    const user = check.rows ? check.rows[0] : null;

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please register or verify spelling." });
    }

    const hash = hashPassword(password);
    const savedHash = user.passwordhash || user.passwordHash;
    if (savedHash !== hash) {
      return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
    }

    const userId = user.id;
    const token = generateUserToken(userId, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email: user.email,
        fullName: user.fullname || user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipcode || user.zipCode || "",
        country: user.country || "",
        wishlist: typeof user.wishlist === "string" ? JSON.parse(user.wishlist) : (user.wishlist || [])
      }
    });
  } catch (err) {
    console.error("POST /api/users/login failure:", err);
    res.status(500).json({ error: "Verification login flow crashed on DB transaction." });
  }
});

app.get("/api/users/me", authenticateUser, async (req: any, res) => {
  try {
    const email = req.user.email;
    const check = await dbQuery("SELECT * FROM users WHERE email = $1", [email]);
    const user = check.rows ? check.rows[0] : null;

    if (!user) {
      return res.status(404).json({ error: "User profile record not found." });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullname || user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipcode || user.zipCode || "",
      country: user.country || "",
      wishlist: typeof user.wishlist === "string" ? JSON.parse(user.wishlist) : (user.wishlist || [])
    });
  } catch (err) {
    console.error("GET /api/users/me failure:", err);
    res.status(500).json({ error: "Failed to retrieve authenticated buyer data." });
  }
});

app.put("/api/users/profile", authenticateUser, async (req: any, res) => {
  try {
    const { fullName, phone, address, city, state, zipCode, country } = req.body;
    const id = req.user.userId;

    if (!fullName) {
      return res.status(400).json({ error: "Full Name is required." });
    }

    await dbQuery(`
      UPDATE users SET fullName = $1, phone = $2, address = $3, city = $4, state = $5, "zipCode" = $6, country = $7
      WHERE id = $8
    `, [
      fullName.trim(),
      phone ? phone.trim() : "",
      address ? address.trim() : "",
      city ? city.trim() : "",
      state ? state.trim() : "",
      zipCode ? zipCode.trim() : "",
      country ? country.trim() : "",
      id
    ]);

    res.json({
      success: true,
      message: "Profile settings modified successfully."
    });
  } catch (err) {
    console.error("PUT /api/users/profile failure:", err);
    res.status(500).json({ error: "Failed to update profile settings parameters." });
  }
});

app.post("/api/users/wishlist", authenticateUser, async (req: any, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "product ID is required to toggle list saved status." });
    }

    const email = req.user.email;
    const check = await dbQuery("SELECT * FROM users WHERE email = $1", [email]);
    const user = check.rows ? check.rows[0] : null;

    if (!user) {
      return res.status(404).json({ error: "Buyer profile not found." });
    }

    let wishlistArr: string[] = [];
    if (typeof user.wishlist === "string") {
      try {
        wishlistArr = JSON.parse(user.wishlist);
      } catch (e) {
        wishlistArr = [];
      }
    } else if (Array.isArray(user.wishlist)) {
      wishlistArr = user.wishlist;
    }

    if (wishlistArr.includes(productId)) {
      wishlistArr = wishlistArr.filter(id => id !== productId);
    } else {
      wishlistArr.push(productId);
    }

    await dbQuery("UPDATE users SET wishlist = $1 WHERE id = $2", [JSON.stringify(wishlistArr), user.id]);

    res.json({
      success: true,
      wishlist: wishlistArr
    });
  } catch (err) {
    console.error("POST /api/users/wishlist failure:", err);
    res.status(500).json({ error: "Database exception toggling item in your wishlist." });
  }
});

app.get("/api/users/orders", authenticateUser, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const authenticatedUserId = req.user.userId;

    // Fetch all orders
    const result = await dbQuery("SELECT * FROM orders ORDER BY createdAt DESC");
    const formatted = result.rows.map(o => ({
      id: o.id,
      userId: o.userId || o.userid || null,
      customer: typeof o.customer === "string" ? JSON.parse(o.customer) : o.customer,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      payPalTransactionId: o.paypaltransactionid || o.payPalTransactionId || "",
      amountPaid: o.amountpaid || o.amountPaid || 0,
      paymentScreenshot: o.paymentscreenshot || o.paymentScreenshot || "",
      createdAt: Number(o.createdat || o.createdAt),
      paymentMethod: o.paymentMethod || o.paymentmethod || "card",
      originalTotal: o.originalTotal !== undefined && o.originalTotal !== null ? Number(o.originalTotal) : (o.originaltotal !== undefined && o.originaltotal !== null ? Number(o.originaltotal) : o.total),
      discountAmount: o.discountAmount !== undefined && o.discountAmount !== null ? Number(o.discountAmount) : (o.discountamount !== undefined && o.discountamount !== null ? Number(o.discountamount) : 0),
      paymentStatus: o.paymentStatus || o.paymentstatus || "Pending"
    }));

    // Filter order list based strictly on matching user's id (and fallback to email if legacy order with no userId exists)
    // Security REQUIREMENT: Users can ONLY see their own orders. No cross-user data access allowed.
    const userOrders = formatted.filter(o => 
      String(o.userId) === String(authenticatedUserId) ||
      (!o.userId && o.customer && o.customer.email && o.customer.email.toLowerCase().trim() === email)
    );

    res.json(userOrders);
  } catch (err) {
    console.error("GET /api/users/orders failure:", err);
    res.status(500).json({ error: "Unable to find buyer checkout history records." });
  }
});

// Scan .NET 8 codebase files
app.get("/api/dotnet-code/files", (req, res) => {
  try {
    const targetDir = path.join(process.cwd(), "dotnet-src");
    const result: any[] = [];

    function scan(dir: string, base: string = "") {
      if (!fs.existsSync(dir)) return;
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const relPath = path.join(base, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          scan(filePath, relPath);
        } else {
          if (
            file.endsWith(".cs") ||
            file.endsWith(".cshtml") ||
            file.endsWith(".json") ||
            file.endsWith(".md") ||
            file.endsWith(".config")
          ) {
            const content = fs.readFileSync(filePath, "utf-8");
            result.push({
              name: file,
              path: relPath.replace(/\\/g, "/"),
              content
            });
          }
        }
      });
    }

    scan(targetDir);
    res.json(result);
  } catch (err) {
    console.error("Dotnet scanning API failure:", err);
    res.status(500).json({ error: "Failed scanning backend elements." });
  }
});

// Setup dev and production runtime pipelines
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
