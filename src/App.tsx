import React, { useState, useEffect, useRef } from "react";
import { 
  Smartphone,
  Zap,
  Send,
  Check,
  Wallet,
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  Trash2, 
  Minus, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Info,
  Menu,
  ShieldCheck, 
  CreditCard, 
  FileCheck, 
  DollarSign, 
  Clock, 
  Package, 
  Tag, 
  Settings, 
  LogOut, 
  Eye, 
  ChevronDown, 
  HelpCircle,
  Percent,
  Github,
  Star,
  MessageSquare,
  Upload,
  X,
  Image,
  User,
  Heart,
  MapPin,
  Globe,
  Phone,
  Home,
  Share2,
  Loader2,
  Download,
  FileText,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, useParams, Routes, Route } from "react-router-dom";
import { Category, Product, CartItem, Customer, Order, PayPalSettings } from "./types";
import { downloadInvoiceAsImage } from "./utils/invoiceGenerator";

interface SetViewProps {
  view: string;
  onViewChange: (v: string) => void;
  onProductChange?: (p: Product | null) => void;
}

function SetView({ view, onViewChange, onProductChange }: SetViewProps) {
  useEffect(() => {
    onViewChange(view);
    if (onProductChange) {
      onProductChange(null);
    }
  }, [view, onViewChange, onProductChange]);
  return null;
}

interface ProductDetailParamsLoaderProps {
  products: Product[];
  setSelectedProduct: (p: Product | null) => void;
  setCurrentView: (v: string) => void;
}

function ProductDetailParamsLoader({ 
  products, 
  setSelectedProduct, 
  setCurrentView 
}: ProductDetailParamsLoaderProps) {
  const { id } = useParams();
  
  useEffect(() => {
    if (products.length > 0 && id) {
      const found = products.find(p => id === p.id || id.startsWith(p.id + "-"));
      if (found) {
        setSelectedProduct(found);
        setCurrentView("detail");
      } else {
        setSelectedProduct(null);
        setCurrentView("catalog");
      }
    }
  }, [id, products, setSelectedProduct, setCurrentView]);

  return null;
}

export default function App() {
  // custom iframe-safe React dialog & notification manager
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    // Clear toast auto-dismiss
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 4500);
  };

  const safeConfirm = (message: string): boolean => {
    return true;
  };

  const safeAlert = (message: string) => {
    showToast(message, "info");
  };

  // Navigation State: 'catalog' | 'detail' | 'checkout' | 'payment-pending' | 'confirmation' | 'admin-login' | 'admin-dashboard' | 'code-explorer'
  const [currentView, _setCurrentView] = useState<string>("catalog");
  const navigate = useNavigate();
  const location = useLocation();

  const setCurrentView = (view: string) => {
    if (view === "catalog") {
      navigate("/");
    } else if (view === "cart") {
      navigate("/cart");
    } else if (view === "checkout") {
      navigate("/checkout");
    } else if (view === "profile") {
      navigate("/profile");
    } else if (view === "auth") {
      navigate("/auth");
    } else if (view === "admin-login") {
      navigate("/admin/login");
    } else if (view === "admin-dashboard") {
      navigate("/admin/dashboard");
    } else if (view === "confirmation") {
      navigate("/order-success");
    } else if (view === "payment-pending") {
      navigate("/payment-pending");
    } else if (view === "detail") {
      if (selectedProduct) {
        const slug = selectedProduct.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        navigate(`/product/${selectedProduct.id}-${slug}`);
      } else {
        navigate("/");
      }
    }
  };
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Country-based State
  const [selectedCountry, setSelectedCountryState] = useState<"US" | "UK">(() => {
    const saved = localStorage.getItem("selected-country");
    if (saved === "UK" || saved === "US") return saved;
    return "US";
  });
  const [showCountryModal, setShowCountryModal] = useState<boolean>(() => {
    return !localStorage.getItem("selected-country");
  });

  const changeSelectedCountry = (country: "US" | "UK") => {
    setSelectedCountryState(country);
    localStorage.setItem("selected-country", country);
    document.cookie = `selected-country=${country};path=/;max-age=31536000`; // 1 year cookie expiry
    showToast(`Region adjusted to ${country === "UK" ? "United Kingdom (GBP)" : "United States (USD)"}`, "success");
  };

  const [settings, setSettings] = useState<PayPalSettings>({
    paypalEmail: "merchant-billing@rare.us",
    businessName: "RARE USA",
    isEnabled: true,
    mobileWalletEnabled: true,
    mobileWalletInfo: "bKash / Nagad Wallet: +8801711112222",
    mobileWalletDiscount: 15.0,
    zelleEnabled: true,
    zelleInfo: "Zelle Transfer Email: payzelle@example.com (Recipient: Store Merchant)",
    zelleDiscount: 8.0,
    payoneerEnabled: true,
    payoneerInfo: "Account Number: 1234567890, Routing number: 987654321, Receiver Name: RARE USA LLC",
    payoneerDiscount: 0.0,
    paypalEnabled: true,
    paypalInfo: "PayPal Merchant Account: sales@example.com",
    paypalDiscount: 0.0,
    cardEnabled: true,
    ukExchangeRate: 0.79,
    ukTaxRate: 12.0,
    ukAdjustmentPercent: 0.0
  });
  
  // App UI state
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [selectedProduct, _setSelectedProduct] = useState<Product | null>(null);

  const setSelectedProduct = (product: Product | null) => {
    _setSelectedProduct(product);
    if (product) {
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""); // clean kebab slug
      navigate(`/product/${product.id}-${slug}`);
    }
  };

  const formatPrice = (priceInUsd: number) => {
    if (selectedCountry === "UK") {
      const rate = settings.ukExchangeRate ?? 0.79;
      const adjustment = settings.ukAdjustmentPercent ?? 0.0;
      let val = priceInUsd * rate;
      if (adjustment !== 0) {
        val = val * (1 + adjustment / 100.0);
      }
      return `£${val.toFixed(2)}`;
    }
    return `$${priceInUsd.toFixed(2)}`;
  };
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout & Payment states
  const [checkoutForm, setCheckoutForm] = useState<Customer>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("wallet");
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem("rare_active_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [paypalTxId, setPaypalTxId] = useState("");
  const [paymentAmountPaid, setPaymentAmountPaid] = useState("");
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState("");
  const [activeScreenshotZoom, setActiveScreenshotZoom] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  // Admin Auth state
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [adminError, setAdminError] = useState("");
  const [adminActiveTab, setAdminActiveTab] = useState<string>("dashboard"); // 'dashboard' | 'orders' | 'products' | 'categories' | 'settings' | 'export'

  // Buyer Authentication State
  const [buyerToken, setBuyerToken] = useState<string | null>(localStorage.getItem("buyerToken"));
  const [authRedirectAfterLogin, setAuthRedirectAfterLogin] = useState<boolean>(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const [buyerUser, setBuyerUser] = useState<any | null>(null);
  const [buyerLoginEmail, setBuyerLoginEmail] = useState("");
  const [buyerLoginPassword, setBuyerLoginPassword] = useState("");
  const [buyerRegisterEmail, setBuyerRegisterEmail] = useState("");
  const [buyerRegisterPassword, setBuyerRegisterPassword] = useState("");
  const [buyerRegisterName, setBuyerRegisterName] = useState("");
  const [buyerRegisterPhone, setBuyerRegisterPhone] = useState("");
  const [buyerRegisterAddress, setBuyerRegisterAddress] = useState("");
  const [buyerRegisterCity, setBuyerRegisterCity] = useState("");
  const [buyerRegisterState, setBuyerRegisterState] = useState("");
  const [buyerRegisterZip, setBuyerRegisterZip] = useState("");
  const [buyerRegisterCountry, setBuyerRegisterCountry] = useState("USA");
  const [buyerAuthError, setBuyerAuthError] = useState("");
  const [buyerAuthSuccess, setBuyerAuthSuccess] = useState("");
  const [buyerAuthMode, setBuyerAuthMode] = useState<"login" | "signup">("login");
  const [isSubmittingBuyerAuth, setIsSubmittingBuyerAuth] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSubmittingPaymentClaim, setIsSubmittingPaymentClaim] = useState(false);
  
  // Profile system state
  const [profileTab, setProfileTab] = useState<"profile" | "orders" | "wishlist" | "settings">("orders");
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [selectedBuyerOrderDetail, setSelectedBuyerOrderDetail] = useState<any | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [isDetailImageZoomed, setIsDetailImageZoomed] = useState<boolean>(false);

  // Admin CRUD states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryInputName, setCategoryInputName] = useState("");
  const [newCatName, setNewCatName] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormImages, setProductFormImages] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    images: "", // split by comma
    stock: "10",
    sku: ""
  });
  const [showProductModal, setShowProductModal] = useState(false);

  // Reviews submit states
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Removed old manual routing and state sync code

  // Direct share link helper
  const handleShareProduct = (product: Product) => {
    const slug = product.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const shareUrl = `${window.location.origin}/product/${product.id}-${slug}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showToast("Product link copied to clipboard! Share it anywhere.", "success");
        })
        .catch((err) => {
          console.error("Could not copy link:", err);
          showToast(`Product URL: ${shareUrl}`, "info");
        });
    } else {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        showToast("Product link copied to clipboard! Share it anywhere.", "success");
      } catch (err) {
        console.error("Fallback copy failed:", err);
        showToast(`Product URL: ${shareUrl}`, "info");
      }
      document.body.removeChild(el);
    }
  };

  // Load Store Products & Categories
  const fetchStoreData = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products", err));

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories", err));

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings", err));

    if (adminToken) {
      fetchOrders();
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [adminToken]);

  useEffect(() => {
    if (activeOrder) {
      setPaymentAmountPaid(activeOrder.total.toString());
      setPaymentScreenshotBase64("");
      try {
        localStorage.setItem("rare_active_order", JSON.stringify(activeOrder));
      } catch (err) {
        console.warn("Storage write failure for activeOrder:", err);
      }
    } else {
      localStorage.removeItem("rare_active_order");
    }
  }, [activeOrder]);

  // Reusable helper to fetch current buyer's order history
  const fetchBuyerOrders = React.useCallback(() => {
    if (buyerToken) {
      fetch("/api/users/orders", {
        headers: { "Authorization": `Bearer ${buyerToken}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(orders => setBuyerOrders(orders))
        .catch(err => console.error("Error fetching user orders:", err));
    } else {
      setBuyerOrders([]);
    }
  }, [buyerToken]);

  // Sync selectedBuyerOrderDetail when buyerOrders is updated
  useEffect(() => {
    if (selectedBuyerOrderDetail && buyerOrders.length > 0) {
      const liveOrder = buyerOrders.find(o => String(o.id) === String(selectedBuyerOrderDetail.id));
      if (liveOrder && JSON.stringify(liveOrder) !== JSON.stringify(selectedBuyerOrderDetail)) {
        setSelectedBuyerOrderDetail(liveOrder);
      }
    }
  }, [buyerOrders, selectedBuyerOrderDetail]);

  // Refetch order details on window/tab focus
  useEffect(() => {
    if (!buyerToken) return;
    const handleFocus = () => {
      fetchBuyerOrders();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [buyerToken, fetchBuyerOrders]);

  // Refetch orders when visual sections change (currentView, selectedBuyerOrderDetail, profileTab)
  useEffect(() => {
    if (buyerToken && (currentView === "profile" || selectedBuyerOrderDetail)) {
      fetchBuyerOrders();
    }
  }, [buyerToken, currentView, selectedBuyerOrderDetail, profileTab, fetchBuyerOrders]);

  // Periodic automatic refetch loop to sync admin and buyer-side status in real-time
  useEffect(() => {
    if (!buyerToken) return;
    const interval = setInterval(() => {
      if (currentView === "profile" || selectedBuyerOrderDetail) {
        fetchBuyerOrders();
      }
    }, 4000); // Poll every 4 seconds for immediate sync
    return () => clearInterval(interval);
  }, [buyerToken, currentView, selectedBuyerOrderDetail, fetchBuyerOrders]);

  // Intercept guest checkout attempt and redirect to Auth view
  useEffect(() => {
    if (currentView === "checkout" && !buyerToken) {
      setAuthRedirectAfterLogin(true);
      setAuthRedirectMessage("Please login or create an account to place your order");
      setBuyerAuthMode("login");
      setCurrentView("auth");
    }
  }, [currentView, buyerToken]);

  // Reset redirect state when navigating elsewhere
  useEffect(() => {
    if (currentView !== "checkout" && currentView !== "auth") {
      setAuthRedirectAfterLogin(false);
      setAuthRedirectMessage(null);
    }
  }, [currentView]);

  // Synchronize Buyer Information on session tokens mutation
  useEffect(() => {
    if (buyerToken) {
      localStorage.setItem("buyerToken", buyerToken);
      
      // Fetch user profile
      fetch("/api/users/me", {
        headers: { "Authorization": `Bearer ${buyerToken}` }
      })
        .then(res => {
          if (!res.ok) {
            localStorage.removeItem("buyerToken");
            setBuyerToken(null);
            setBuyerUser(null);
            throw new Error("Expired session. Cleared.");
          }
          return res.json();
        })
        .then(user => {
          setBuyerUser(user);
          // Prefill checkout form optionally
          setCheckoutForm(prev => ({
            ...prev,
            fullName: prev.fullName || user.fullName || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone || "",
            address: prev.address || user.address || "",
            city: prev.city || user.city || "",
            state: prev.state || user.state || "",
            zipCode: prev.zipCode || user.zipCode || user.zipcode || "",
            country: prev.country || user.country || "USA"
          }));
        })
        .catch(err => {
          console.warn("Buyer fetch profiles exception:", err);
        });

      // Fetch user orders immediately
      fetchBuyerOrders();
    } else {
      localStorage.removeItem("buyerToken");
      setBuyerUser(null);
      setBuyerOrders([]);
    }
  }, [buyerToken]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewedIds");
      if (stored && products.length > 0) {
        const ids: string[] = JSON.parse(stored);
        const resolved = ids
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(resolved);
      }
    } catch (e) {
      console.warn("Error loading recently viewed list", e);
    }
  }, [products]);

  const recordProductView = (prod: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== prod.id);
      const updated = [prod, ...filtered].slice(0, 6);
      try {
        localStorage.setItem("recentlyViewedIds", JSON.stringify(updated.map(p => p.id)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (selectedProduct) {
      recordProductView(selectedProduct);
      setActiveImgIndex(0);
      setIsDetailImageZoomed(false);
    }
  }, [selectedProduct]);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders", err));
  };

  // --- REVIEWS SYSTEM HANDLER ---
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError("Please provide your name and a detailed comment body.");
      return;
    }

    setReviewError("");
    setReviewSuccess("");
    setIsSubmittingReview(true);

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });

      if (!response.ok) {
        throw new Error("Failed to post your customer review. Please verify server status.");
      }

      const newReview = await response.json();
      
      // Merge new review into current active detailed product object
      const updatedProduct = {
        ...selectedProduct,
        reviews: [newReview, ...(selectedProduct.reviews || [])]
      };
      setSelectedProduct(updatedProduct);

      // Merge into complete catalog list for instantaneous rating calculations in grid lists
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));

      // Reset fields
      setReviewName("");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess("Thank you! Your verified product review was logged successfully.");
    } catch (err: any) {
      setReviewError(err.message || "An error occurred while transmitting reviews.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- CART FUNCTIONS ---
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0],
        sku: product.sku
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Standard sales tax rate (estimated average 8% US, 12% UK)
  const isSelectedUkMode = selectedCountry === "UK";
  const isTaxEnabled = settings.taxEnabled !== false;
  const checkoutTaxRate = isTaxEnabled
    ? (isSelectedUkMode ? (settings.ukTaxRate !== undefined ? settings.ukTaxRate : 12.0) : (settings.usaTaxRate !== undefined ? settings.usaTaxRate : 8.0)) / 100.0
    : 0.0;
  const checkoutTax = Math.round(cartSubtotal * checkoutTaxRate * 100) / 100;
  const checkoutShipping = cartSubtotal > 75 || cartSubtotal === 0 ? 0 : 9.99;
  const checkoutTotal = Math.round((cartSubtotal + checkoutTax + checkoutShipping) * 100) / 100;

  // --- CHECKOUT SUBMISSION ---
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!checkoutForm.fullName || !checkoutForm.email || !checkoutForm.address || !checkoutForm.city || !checkoutForm.state || !checkoutForm.zipCode) {
      setCheckoutError("Please complete all required fields to register shipping instructions.");
      return;
    }

    const payload = {
      customer: { ...checkoutForm, country: selectedCountry },
      items: cart,
      paymentMethod: selectedPaymentMethod
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-selected-country": selectedCountry,
        ...(buyerToken ? { "Authorization": `Bearer ${buyerToken}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.json();
          throw new Error(text.error || "Order submission failed");
        }
        return res.json();
      })
      .then((order: any) => {
        setActiveOrder(order);
        setCart([]); // Clear cart items
        if (buyerToken) {
          // Prepend order instantly to make it appear immediately
          setBuyerOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
          // Also fetch newest list from database
          fetchBuyerOrders();
        }
        setCurrentView("payment-pending");
      })
      .catch(err => {
        setCheckoutError(err.message);
      });
  };

  // --- BUYER LOGIN, REGISTER, PROFILE, WISHLIST HANDLERS ---
  const handleBuyerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerLoginEmail.trim() || !buyerLoginPassword) {
      setBuyerAuthError("Please provide your email and password.");
      return;
    }
    setBuyerAuthError("");
    setBuyerAuthSuccess("");
    setIsSubmittingBuyerAuth(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: buyerLoginEmail,
          password: buyerLoginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login verification failed.");
      }
      showToast("Signed in successfully!", "success");
      setBuyerToken(data.token);
      setBuyerUser(data.user);
      
      // Go back to previous view or catalog
      if (authRedirectAfterLogin) {
        setAuthRedirectAfterLogin(false);
        setAuthRedirectMessage(null);
        setCurrentView("checkout");
      } else {
        setCurrentView("catalog");
      }
      // Clear forms
      setBuyerLoginEmail("");
      setBuyerLoginPassword("");
    } catch (err: any) {
      setBuyerAuthError(err.message || "Failed to sign in.");
    } finally {
      setIsSubmittingBuyerAuth(false);
    }
  };

  const handleBuyerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerRegisterEmail.trim() || !buyerRegisterPassword || !buyerRegisterName.trim()) {
      setBuyerAuthError("Full Name, Email and Password are required.");
      return;
    }
    setBuyerAuthError("");
    setBuyerAuthSuccess("");
    setIsSubmittingBuyerAuth(true);

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: buyerRegisterEmail,
          password: buyerRegisterPassword,
          fullName: buyerRegisterName,
          phone: buyerRegisterPhone,
          address: buyerRegisterAddress,
          city: buyerRegisterCity,
          state: buyerRegisterState,
          zipCode: buyerRegisterZip,
          country: buyerRegisterCountry
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration process failed.");
      }
      showToast("Account created successfully!", "success");
      setBuyerToken(data.token);
      setBuyerUser(data.user);
      if (authRedirectAfterLogin) {
        setAuthRedirectAfterLogin(false);
        setAuthRedirectMessage(null);
        setCurrentView("checkout");
      } else {
        setCurrentView("catalog");
      }
      // Clear forms
      setBuyerRegisterEmail("");
      setBuyerRegisterPassword("");
      setBuyerRegisterName("");
      setBuyerRegisterPhone("");
      setBuyerRegisterAddress("");
      setBuyerRegisterCity("");
      setBuyerRegisterState("");
      setBuyerRegisterZip("");
    } catch (err: any) {
      setBuyerAuthError(err.message || "Failed to create account.");
    } finally {
      setIsSubmittingBuyerAuth(false);
    }
  };

  const handleUpdateBuyerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerUser || !buyerUser.fullName) {
      showToast("Full name is required.", "error");
      return;
    }
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${buyerToken}`
        },
        body: JSON.stringify({
          fullName: buyerUser.fullName,
          phone: buyerUser.phone,
          address: buyerUser.address,
          city: buyerUser.city,
          state: buyerUser.state,
          zipCode: buyerUser.zipCode || buyerUser.zipcode,
          country: buyerUser.country
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile details.");
      }
      showToast("Profile settings updated successfully!", "success");
      // Fetch latest profile state from DB
      fetch("/api/users/me", { headers: { "Authorization": `Bearer ${buyerToken}` }})
        .then(r => r.json())
        .then(user => setBuyerUser(user))
        .catch(err => console.error(err));
    } catch (err: any) {
      showToast(err.message || "Failed to edit profile details", "error");
    }
  };

  const toggleWishlist = async (prodId: string) => {
    if (!buyerToken) {
      showToast("Please sign in or create an account to save wishlist items.", "info");
      setCurrentView("auth");
      return;
    }
    try {
      const res = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${buyerToken}`
        },
        body: JSON.stringify({ productId: prodId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle item.");
      }
      
      // Update buyerUser wishlist array in state
      setBuyerUser((prev: any) => ({
        ...prev,
        wishlist: data.wishlist
      }));
      
      const isSaved = data.wishlist.includes(prodId);
      showToast(isSaved ? "Saved to Wishlist!" : "Removed from Wishlist.", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to modify wishlist", "error");
    }
  };

  const handleLogoutBuyer = () => {
    setBuyerToken(null);
    setBuyerUser(null);
    setBuyerOrders([]);
    showToast("Logged out successfully.", "info");
    setCurrentView("catalog");
  };

  // --- PAYPAL MANUAL TRANSACTION ID SUBMISSION ---
  const handlePaypalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const method = activeOrder.paymentMethod || "wallet";
    
    // Strict requirement checks:
    if (method === "wallet") {
      if (!paypalTxId.trim() && !paymentScreenshotBase64) {
        showToast("Require transaction ID or payment screenshot upload as proof of Mobile Wallet Pay transfer.", "error");
        return;
      }
    } else {
      if (!paypalTxId.trim()) {
        showToast("Please enter your transaction reference number to reconcile payment.", "error");
        return;
      }
    }

    const txIdValue = paypalTxId.trim() || `PROOF-${activeOrder.id}-${Date.now().toString().slice(-4)}`;

    setIsSubmittingPaymentClaim(true);
    fetch(`/api/orders/${activeOrder.id}/pay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        payPalTransactionId: txIdValue,
        amountPaid: paymentAmountPaid ? parseFloat(paymentAmountPaid) : activeOrder.total,
        paymentScreenshot: paymentScreenshotBase64
      })
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.json();
          throw new Error(text.error || "Failed to register your payment transaction verification.");
        }
        return res.json();
      })
      .then((updatedOrder: Order) => {
        setActiveOrder(updatedOrder);
        showToast("Payment submitted successfully! Waiting for admin verification.", "success");
        setCurrentView("confirmation");
        fetchStoreData();
      })
      .catch(err => {
        showToast(err.message || "Failed to register your payment transaction verification.", "error");
        console.error(err);
      })
      .finally(() => {
        setIsSubmittingPaymentClaim(false);
      });
  };

  // --- ADMIN LOGIN ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: adminUser, password: adminPass })
    })
      .then(async res => {
        if (!res.ok) {
          const detail = await res.json();
          throw new Error(detail.error || "Authentication failed");
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem("adminToken", data.token);
        setAdminToken(data.token);
        setAdminUser("");
        setAdminPass("");
        setCurrentView("admin-dashboard");
        setAdminActiveTab("dashboard");
        fetchOrders();
      })
      .catch(err => {
        setAdminError(err.message);
      });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setCurrentView("catalog");
  };

  // --- ADMIN STATUS VERIFICATION CONTROL ---
  const handleVerifyPayment = (orderId: string, isApproved: boolean) => {
    const nextStatus = isApproved ? "Completed" : "Rejected";
    fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchOrders();
        // Also update products list in case stock was decremented during Completes
        fetchStoreData();
      })
      .catch(err => console.error("Error setting verification state", err));
  };

  // --- ADMIN ORDER DELETION HANDLER ---
  const handleDeleteOrder = (orderId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Order Permanently",
      message: `Are you sure you want to permanently delete order #${orderId}? This deletes the entire booking claim record from PostgreSQL, meaning it ceases to exist. This action cannot be reverted.`,
      onConfirm: () => {
        setConfirmConfig(null);
        fetch(`/api/orders/${orderId}`, {
          method: "DELETE"
        })
          .then(res => {
            if (!res.ok) {
              return res.json().then(data => {
                throw new Error(data.error || "Database error while deleting order");
              });
            }
            return res.json();
          })
          .then(() => {
            showToast(`Order #${orderId} has been successfully deleted permanently.`, "success");
            fetchOrders();
            fetchStoreData();
          })
          .catch(err => {
            console.error("Critical: Error deleting order log:", err);
            showToast(err.message || "Failed to execute order permanent deletion.", "error");
          });
      }
    });
  };

  // --- ADMIN ORDER STATUS UPDATER ---
  const handleUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => {
        showToast(`Order #${orderId} status modified to "${nextStatus}".`, "success");
        fetchOrders();
        fetchStoreData();
      })
      .catch(err => {
        console.error("Error updating order status:", err);
        showToast("Failed to update status on target order.", "error");
      });
  };

  // --- ADMIN SETTINGS UPDATER ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then((data: PayPalSettings) => {
        setSettings(data);
        showToast("PayPal compliance merchant credentials and configuration guidelines updated successfully.", "success");
      })
      .catch(err => {
        console.error(err);
        showToast("Failed to modify merchant dashboard settings.", "error");
      });
  };

  // --- ADMIN CATEGORY MANAGEMENT ---
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast(`Category "${newCatName}" was successfully initialized inside storage catalogs.`, "success");
        setNewCatName("");
        fetchStoreData();
      })
      .catch(err => {
        console.error(err);
        showToast("Failed to construct new commerce product category.", "error");
      });
  };

  const handleUpdateCategoryName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryInputName.trim()) return;

    fetch(`/api/categories/${editingCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryInputName.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast(`Category title updated to "${categoryInputName}".`, "success");
        setEditingCategory(null);
        setCategoryInputName("");
        fetchStoreData();
      })
      .catch(err => {
        console.error(err);
        showToast("Failed to modify target category properties.", "error");
      });
  };

  const handleDeleteCategory = (catId: string) => {
    const hasLinkedProds = products.some(p => p.categoryId === catId);
    if (hasLinkedProds) {
      showToast("Cannot remove category. You must shift or delete active product listings associated with it first.", "error");
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Confirm Division Removal",
      message: "Are you sure you want to delete this product category? This can lead to unexpected product grouping results if listings depend on it.",
      onConfirm: () => {
        setConfirmConfig(null);
        fetch(`/api/categories/${catId}`, {
          method: "DELETE"
        })
          .then(res => {
            if (!res.ok) throw new Error("Category deletion failed");
            return res.json();
          })
          .then(() => {
            showToast("The product category registry has been purged.", "success");
            fetchStoreData();
          })
          .catch(err => {
            console.error(err);
            showToast("Failed to remove category registry.", "error");
          });
      }
    });
  };

  // --- ADMIN PRODUCT CRUD ---
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(productForm.price);
    const stockNum = parseInt(productForm.stock);

    if (!productForm.name || isNaN(priceNum) || isNaN(stockNum)) {
      showToast("Please specify a valid product title, numeric price representation, and item inventory quantity.", "error");
      return;
    }

    const payload = {
      name: productForm.name,
      price: priceNum,
      description: productForm.description,
      categoryId: productForm.categoryId,
      images: productFormImages,
      stock: stockNum,
      sku: productForm.sku || "SKU-" + Math.floor(Math.random() * 100000)
    };

    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        showToast(`Product listing for "${productForm.name}" preserved successfully inside storage databases.`, "success");
        setShowProductModal(false);
        setEditingProduct(null);
        setProductFormImages([]);
        setProductForm({
          name: "",
          price: "",
          description: "",
          categoryId: "",
          images: "",
          stock: "10",
          sku: ""
        });
        fetchStoreData();
      })
      .catch(err => {
        console.error("Error maintaining product document:", err);
        showToast("Could not store product parameters properly.", "error");
      });
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: String(prod.price),
      description: prod.description || "",
      categoryId: prod.categoryId || "",
      images: prod.images.join(", "),
      stock: String(prod.stock),
      sku: prod.sku
    });
    setProductFormImages(prod.images || []);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (prodId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remove Commerce Listing",
      message: `Are you sure you want to permanently delete product "${products.find(p => p.id === prodId)?.name || prodId}"? This will vanish the item listing.`,
      onConfirm: () => {
        setConfirmConfig(null);
        fetch(`/api/products/${prodId}`, {
          method: "DELETE"
        })
          .then(res => {
            if (!res.ok) throw new Error("Product deletion failed");
            return res.json();
          })
          .then(() => {
            showToast("The product listing has been cleared successfully.", "success");
            fetchStoreData();
          })
          .catch(err => {
            console.error(err);
            showToast("Failed to remove product item.", "error");
          });
      }
    });
  };

  // --- CATALOG FILTERING & SORTING ---
  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory ? p.categoryId === activeCategory : true;
    const matchSearch = searchQuery 
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price_asc") return a.price - b.price;
    if (sortOption === "price_desc") return b.price - a.price;
    // default/newest
    return b.id.localeCompare(a.id);
  });

  // Calculate high-level admin metrics
  const adminCompletedOrders = orders.filter(o => o.status === "Completed");
  const adminPendingOrders = orders.filter(o => o.status === "Pending");
  const adminWaitingOrders = orders.filter(o => o.status === "Waiting For Verification");
  const adminRevenueSet = adminCompletedOrders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
      {/* 1. AMAZON/WALMART STYLE COMPACT PRIMARY HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm leading-tight">
        {/* Upper utilities row for a realistic Walmart/Amazon vibe */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 hidden sm:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-yellow-500" />
                Deliver to <strong className="text-white">{selectedCountry === "UK" ? "United Kingdom" : "United States"}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span>Everyday Free Shipping on orders over <strong className="text-white">{formatPrice(75)}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (adminToken) {
                    setCurrentView("admin-dashboard");
                  } else {
                    setCurrentView("admin-login");
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer text-slate-400 text-[10px] tracking-wide"
              >
                Administrative Entrance
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo area */}
            <div 
              onClick={() => {
                setCurrentView("catalog");
                setActiveCategory("");
                setSearchQuery("");
              }}
              className="flex items-center gap-2 cursor-pointer shrink-0"
              id="brand_logo"
            >
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1 font-sans">
                  RARE
                  <span className="text-yellow-500 text-xl font-extrabold pb-0.5">▪</span>
                  <span className="text-xs font-bold text-blue-600 tracking-wider bg-blue-50 px-1.5 py-0.5 rounded leading-none">US</span>
                </span>
              </div>
            </div>

            {/* Direct Search input bar (Primary focus in center) */}
            <div className="flex-1 max-w-2xl relative">
              <form onSubmit={(e) => { e.preventDefault(); if(currentView !== "catalog") setCurrentView("catalog"); }} className="flex w-full items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    id="buyer_search_input"
                    placeholder="Search over premium tech, apparel, style guides, and gear..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (currentView !== "catalog") {
                        setCurrentView("catalog");
                      }
                    }}
                    className="w-full bg-slate-100 border border-slate-200 outline-none rounded-l-full py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-500 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-4 py-2 rounded-r-full text-xs shadow-sm transition-all border border-yellow-500 border-l-0 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Account desk, wishlist & cart badge shortcuts */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Buyer Authentication state dropdown shortcut */}
              <div 
                className="relative"
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    if (buyerToken) {
                      setCurrentView("profile");
                      setProfileTab("orders");
                      setSelectedBuyerOrderDetail(null);
                    } else {
                      setCurrentView("auth");
                    }
                  }}
                  className="text-left py-1 text-xs flex items-center gap-1.5 hover:text-blue-600 transition-all cursor-pointer bg-transparent border-0 outline-none"
                  title={buyerToken ? "Manage Account Profile / Order History" : "Sign In or Register"}
                  id="header_account_trigger"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <div className="hidden md:block leading-none">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {buyerToken && buyerUser ? `Hello, ${buyerUser.fullName.split(" ")[0]}` : "Hello, Sign In"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-0.5">
                      <span>{buyerToken ? "Account & Lists" : "Account"}</span>
                      <ChevronDown size={11} className="text-slate-400 mt-0.5" />
                    </span>
                  </div>
                </button>

                {/* Dropdown Card */}
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-250/70 rounded-2xl shadow-xl p-3 z-[150] anim-dropdown animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-slate-100/65 mb-2">
                      <p className="text-[9px] uppercase font-black text-slate-400 font-mono tracking-widest">Profile Desk</p>
                      <p className="text-xs font-bold text-slate-855 truncate mt-0.5">
                        {buyerToken && buyerUser ? buyerUser.fullName : "Guest Shopper"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {buyerToken ? (
                        <>
                          <button
                            onClick={() => {
                              setCurrentView("profile");
                              setProfileTab("orders");
                              setSelectedBuyerOrderDetail(null);
                              setIsAccountDropdownOpen(false);
                            }}
                            id="dropdown_order_history"
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
                          >
                            <ShoppingBag size={14} className="text-slate-400" />
                            <span>Order History</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentView("profile");
                              setProfileTab("profile");
                              setSelectedBuyerOrderDetail(null);
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
                          >
                            <User size={14} className="text-slate-400" />
                            <span>My Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setCurrentView("profile");
                              setProfileTab("wishlist");
                              setSelectedBuyerOrderDetail(null);
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
                          >
                            <Heart size={14} className="text-slate-400" />
                            <span>Saved Items</span>
                          </button>

                          <div className="border-t border-slate-100 my-1 pt-1 Packed"></div>

                          <button
                            onClick={() => {
                              handleLogoutBuyer();
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
                          >
                            <LogOut size={14} />
                            <span>Sign Out Account</span>
                          </button>
                        </>
                      ) : (
                        <div className="p-1 text-center">
                          <button
                            onClick={() => {
                              setBuyerAuthMode("login");
                              setCurrentView("auth");
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full bg-blue-650 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5 border-0"
                          >
                            <span>Sign In to Your Account</span>
                          </button>
                          <p className="text-[10px] text-slate-450 mt-2 font-sans">
                            New shopper?{" "}
                            <button
                              onClick={() => {
                                setBuyerAuthMode("signup");
                                setCurrentView("auth");
                                setIsAccountDropdownOpen(false);
                              }}
                              className="text-blue-600 hover:underline font-bold bg-transparent border-0 outline-none p-0 cursor-pointer text-[10px]"
                            >
                              Register here
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Wishlist block */}
              {buyerToken && (
                <button
                  onClick={() => {
                    setCurrentView("profile");
                    setProfileTab("wishlist");
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors hidden sm:block cursor-pointer"
                  title="View Saved Items"
                >
                  <Heart size={18} className={buyerUser?.wishlist?.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                </button>
              )}

              {/* Regional Country Selector Trigger */}
              <button
                onClick={() => setShowCountryModal(true)}
                className="flex items-center gap-1.5 p-1.5 px-2 bg-slate-50 border border-slate-250 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-700 hover:text-slate-900 group"
                title={`Region: ${selectedCountry === "UK" ? "United Kingdom (GBP £)" : "United States (USD $)"}. Click to change.`}
              >
                {selectedCountry === "UK" ? (
                  <>
                    <span className="text-sm shrink-0 leading-none" role="img" aria-label="UK flag">🇬🇧</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-slate-850 leading-none group-hover:text-blue-600">UK (£)</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm shrink-0 leading-none" role="img" aria-label="US flag">🇺🇸</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-slate-850 leading-none group-hover:text-blue-600">US ($)</span>
                  </>
                )}
              </button>

              {/* Cart element shortcut */}
              <button
                onClick={() => {
                  setCurrentView("cart");
                  setIsCartOpen(false);
                }}
                className={`relative p-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === "cart" || cartItemCount > 0
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                id="cart_trigger_button"
              >
                <ShoppingBag size={18} />
                <span className="text-xs font-bold font-sans hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. LIVE VIEW SCREEN SWITCHER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hidden Routes block to synchronize with React Router natively */}
        <div className="hidden">
          <Routes>
            <Route path="/" element={<SetView view="catalog" onViewChange={_setCurrentView} onProductChange={_setSelectedProduct} />} />
            <Route path="/cart" element={<SetView view="cart" onViewChange={_setCurrentView} />} />
            <Route path="/checkout" element={<SetView view="checkout" onViewChange={_setCurrentView} />} />
            <Route path="/profile" element={<SetView view="profile" onViewChange={_setCurrentView} />} />
            <Route path="/auth" element={<SetView view="auth" onViewChange={_setCurrentView} />} />
            <Route path="/admin/login" element={<SetView view="admin-login" onViewChange={_setCurrentView} />} />
            <Route path="/admin/dashboard" element={<SetView view="admin-dashboard" onViewChange={_setCurrentView} />} />
            <Route path="/order-success" element={<SetView view="confirmation" onViewChange={_setCurrentView} />} />
            <Route path="/payment-pending" element={<SetView view="payment-pending" onViewChange={_setCurrentView} />} />
            <Route path="/product/:id" element={<ProductDetailParamsLoader products={products} setSelectedProduct={_setSelectedProduct} setCurrentView={_setCurrentView} />} />
          </Routes>
        </div>

        {/* --- VIEW: CATALOG (CUSTOMER-FACING) --- */}
        {currentView === "catalog" && (
          <div>
            {/* 1. AMAZON/WALMART STYLE HERO BANNER */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 md:p-10 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl text-center md:text-left">
                  <span className="font-sans text-[10px] sm:text-xs font-black text-yellow-400 tracking-widest uppercase bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    SUMMER DEALS SPOTLIGHT
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 text-white leading-tight">
                    Everyday Low Prices on <span className="text-yellow-400">Premium Curations</span>
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2 font-sans leading-relaxed">
                    Check out our carefully inspected elite tech, artisan apparel collections, and modern home devices. Fast dispatching and free flat-rate delivery on US orders over $75.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
                    <button 
                      onClick={() => { setActiveCategory(""); setSearchQuery(""); }}
                      className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-slate-950 px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm transition-all cursor-pointer"
                    >
                      Shop Whole Store
                    </button>
                    {categories.length > 0 && (
                      <button
                        onClick={() => { setActiveCategory(categories[0].id); }}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border border-white/10"
                      >
                        Explore {categories[0].name}
                      </button>
                    )}
                  </div>
                </div>

                {/* Micro bento highlights mimicking Amazon homepage widgets */}
                <div className="hidden lg:grid grid-cols-2 gap-3 w-80 shrink-0">
                  <div className="bg-white/95 text-slate-900 rounded-xl p-3 shadow-md flex flex-col justify-between h-32">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">Top Rated</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-2">Elite electronics collection with reviews.</span>
                    <button onClick={() => { setActiveCategory(""); setSortOption("newest"); }} className="text-[10px] text-blue-600 font-extrabold hover:underline text-left mt-1.5 self-start cursor-pointer">See deals</button>
                  </div>
                  <div className="bg-white/95 text-slate-900 rounded-xl p-3 shadow-md flex flex-col justify-between h-32">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">US Flat Rate</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-2">Direct local freight. Average transit: 2 days.</span>
                    <button onClick={() => { setCurrentView("cart"); }} className="text-[10px] text-blue-600 font-extrabold hover:underline text-left mt-1.5 self-start cursor-pointer">Go to cart</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WALK-THROUGH ROW OF HORIZONTAL CATEGORIES */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest font-sans flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-slate-400" />
                  <span>Shop by Category</span>
                </h3>
                {activeCategory && (
                  <button 
                    onClick={() => setActiveCategory("")}
                    className="text-xs font-black text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveCategory("")}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    !activeCategory 
                      ? "bg-slate-900 text-white border-slate-950 shadow-sm" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-350"
                  }`}
                >
                  All Departments
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      activeCategory === c.id 
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-350"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Flash Info Banner */}
            {searchQuery && (
              <div className="mb-6 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-700">
                  Showing matches for search query "<strong>{searchQuery}</strong>" ({sortedProducts.length} items found)
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-black text-blue-600 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* 3. GRID OF FEATURED PRODUCTS (4-6 ITEMS PER ROW) */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
                    {activeCategory 
                      ? `${categories.find(c => c.id === activeCategory)?.name || "Category"} Specials` 
                      : "Deals & Trending Products"
                    }
                  </h2>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-mono">Showing {sortedProducts.length} items</span>
                </div>

                {/* Sort Option Control */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-sm text-xs select-none">
                  <span className="text-slate-400 font-semibold font-mono">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer border-none py-0.5"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="bg-white border border-slate-250/60 rounded-2xl p-14 text-center shadow-sm">
                  <Package size={44} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No matches found</h3>
                  <p className="text-slate-400 text-xs mt-1 mb-4">Try altering your search keywords or choosing another department header.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setActiveCategory(""); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-850 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                /* Structured Grid Layout like Amazon, 4-6 responsive rows */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {sortedProducts.map((p) => {
                    const rvs = p.reviews || [];
                    const count = rvs.length;
                    const avg = count > 0 
                      ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                      : 0;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={p.id}
                        className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-250 flex flex-col h-full"
                        id={`product_card_${p.id}`}
                      >
                        {/* Clean Product Image block */}
                        <div 
                          className="aspect-square bg-slate-50 overflow-hidden relative cursor-pointer flex items-center justify-center p-3" 
                          onClick={() => { setSelectedProduct(p); setCurrentView("detail"); }}
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
                          />
                          <div className="absolute top-2 left-2 bg-slate-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 border border-slate-200">
                            {p.sku}
                          </div>
                          {p.stock <= 5 && p.stock > 0 && (
                            <div className="absolute top-2 right-2 bg-rose-600 text-white px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase font-mono whitespace-nowrap">
                              Only {p.stock} left
                            </div>
                          )}
                        </div>

                        {/* Card metadata and content */}
                        <div className="p-4 flex-1 flex flex-col justify-between text-left">
                          <div>
                            {/* Department path label */}
                            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
                              {categories.find(c => c.id === p.categoryId)?.name || "Premium Goods"}
                            </span>
                            
                            {/* Short Product title (2 lines max override using height limit and line-clamp) */}
                            <h3 
                              className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight line-clamp-2 hover:text-blue-600 h-10 overflow-hidden cursor-pointer"
                              onClick={() => { setSelectedProduct(p); setCurrentView("detail"); }}
                              title={p.name}
                            >
                              {p.name}
                            </h3>

                            {/* Rating Stars - Optional UI made High Fidelity */}
                            <div className="flex items-center gap-1 mt-1.5 h-4 select-none">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={11} 
                                    className={`${i < Math.round(avg || 4.8) ? "fill-amber-400 text-amber-400" : "text-slate-200 whitespace-nowrap"}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-black text-slate-700 font-sans">{avg > 0 ? avg.toFixed(1) : "4.8"}</span>
                              <span className="text-[10px] text-slate-400 font-medium font-mono">({count > 0 ? count : "12"})</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
                            {/* Bold Price Display */}
                            <div className="flex items-baseline justify-between">
                              <div className="font-sans text-left">
                                {(() => {
                                  const displayPriceValue = selectedCountry === "UK"
                                    ? p.price * (settings.ukExchangeRate ?? 0.79) * (1 + (settings.ukAdjustmentPercent ?? 0.0) / 100.0)
                                    : p.price;
                                  return (
                                    <>
                                      <span className="text-slate-900 font-black text-sm">{selectedCountry === "UK" ? "£" : "$"}</span>
                                      <span className="text-slate-900 font-black text-lg">{Math.floor(displayPriceValue)}</span>
                                      <span className="text-slate-900 font-black text-xs">.{(displayPriceValue % 1).toFixed(2).split(".")[1] || "00"}</span>
                                    </>
                                  );
                                })()}
                                <span className="text-[9px] text-slate-400 font-bold tracking-tight block leading-tight font-mono">Everyday Low price</span>
                              </div>
                            </div>

                            {/* Add to Cart button */}
                            <button
                              onClick={() => handleAddToCart(p, 1)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:ring-2 active:ring-blue-300 border border-blue-600 shadow-sm"
                            >
                              <ShoppingBag size={13} />
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ONLY SHOW THOSE EXTRA SECTIONS IF NOT SEARCHING AND NOT FILTERED */}
              {!searchQuery && !activeCategory && products.length > 0 && (
                <div className="space-y-10 mt-12 pt-8 border-t border-slate-100">
                  {/* Trending Products Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Trending Products</h3>
                      <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold font-sans">Bestseller</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                      {products.slice(0, 5).map((p) => {
                        const rvs = p.reviews || [];
                        const count = rvs.length;
                        const avg = count > 0 
                          ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                          : 0;

                        return (
                          <div
                            key={p.id}
                            className="group bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer text-left"
                            onClick={() => { setSelectedProduct(p); setCurrentView("detail"); }}
                          >
                            <div>
                              <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2">
                                <img src={p.images[0]} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-102 transition" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                {categories.find(c => c.id === p.categoryId)?.name || "Premium Goods"}
                              </span>
                              <h4 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-2 h-8 overflow-hidden hover:text-blue-650 leading-tight mt-0.5" title={p.name}>
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1 h-3 select-none">
                                <span className="text-[10px] text-amber-400">★</span>
                                <span className="text-[10px] text-slate-700 font-bold">{avg > 0 ? avg : "4.8"}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 font-mono">{formatPrice(p.price)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(p, 1);
                                }}
                                className="text-[10px] font-bold text-blue-650 hover:underline cursor-pointer"
                              >
                                Buy now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended for You Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recommended for you</h3>
                      <span className="text-[10px] bg-blue-55 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">Personalized</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                      {products.slice(Math.max(0, products.length - 5)).map((p) => {
                        const rvs = p.reviews || [];
                        const count = rvs.length;
                        const avg = count > 0 
                          ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                          : 0;

                        return (
                          <div
                            key={p.id}
                            className="group bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer text-left"
                            onClick={() => { setSelectedProduct(p); setCurrentView("detail"); }}
                          >
                            <div>
                              <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2">
                                <img src={p.images[0]} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-102 transition" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                {categories.find(c => c.id === p.categoryId)?.name || "Premium Goods"}
                              </span>
                              <h4 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-2 h-8 overflow-hidden hover:text-blue-650 leading-tight mt-0.5" title={p.name}>
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1 h-3 select-none">
                                <span className="text-[10px] text-amber-400 font-extrabold">★</span>
                                <span className="text-[10px] text-slate-700 font-bold">{avg > 0 ? avg : "4.8"}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 font-mono">{formatPrice(p.price)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(p, 1);
                                }}
                                className="text-[10px] font-bold text-blue-650 hover:underline cursor-pointer"
                              >
                                Buy now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- VIEW: PRODUCT DETAILS PAGE --- */}
        {currentView === "detail" && selectedProduct && (
          <div>
            {/* Breadcrumb navigator */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-4 select-none text-left">
              <button onClick={() => setCurrentView("catalog")} className="hover:text-blue-600 font-medium">Home</button>
              <span>/</span>
              <button 
                onClick={() => { setCurrentView("catalog"); setActiveCategory(selectedProduct.categoryId); }}
                className="hover:text-blue-600 font-medium"
              >
                {categories.find(c => c.id === selectedProduct.categoryId)?.name || "Department"}
              </button>
              <span>/</span>
              <span className="text-slate-800 font-bold max-w-[200px] truncate">{selectedProduct.name}</span>
            </div>

            {/* Back button */}
            <button
              onClick={() => setCurrentView("catalog")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-center cursor-pointer shadow-sm transition-all active:scale-95 hover:border-slate-300"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>

            {/* TWO-COLUMN REDESIGNED AMAZON/WALMART DETAIL PANEL */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Image Gallery Column (Left - 5 cols on desktop) */}
                <div className="md:col-span-5 space-y-4">
                  {/* Big Image box with Zoom lens / pointer pointer cursor */}
                  <div 
                    className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-150 relative flex items-center justify-center p-4 cursor-zoom-in"
                    onClick={() => setActiveScreenshotZoom(selectedProduct.images[activeImgIndex])}
                    title="Click to zoom image"
                  >
                    <motion.div 
                      className="w-full h-full flex items-center justify-center overflow-hidden"
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <img
                        src={selectedProduct.images[activeImgIndex]}
                        alt={selectedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                    
                    {/* Hover zoom magnifier hint banner */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold font-mono tracking-tight flex items-center gap-1 pointer-events-none select-none">
                      <span>Click to Zoom</span>
                    </div>

                    <div className="absolute top-3 left-3 bg-slate-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 border border-slate-200 pointer-events-none">
                      {selectedProduct.sku}
                    </div>
                  </div>

                  {/* Multi-images Thumbnail row */}
                  {selectedProduct.images.length > 0 && (
                    <div className="flex flex-wrap items-center justify-start gap-2.5 pt-1 select-none">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-16 h-16 rounded-lg bg-white overflow-hidden border p-1 shrink-0 transition-all cursor-pointer ${
                            activeImgIndex === idx 
                              ? "border-yellow-500 ring-2 ring-yellow-100" 
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`view ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info & Cart desk (Right - 7 cols on desktop) */}
                <div className="md:col-span-7 flex flex-col justify-between py-1 text-left">
                  <div className="space-y-4">
                    {/* Badge and Title */}
                    <div>
                      <span className="text-[10px] font-bold font-mono text-blue-600 tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                        {categories.find(c => c.id === selectedProduct.categoryId)?.name || "Premium Goods"}
                      </span>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-3">
                        {selectedProduct.name}
                      </h2>
                    </div>

                    {/* Highly aesthetic reviews stars and counts */}
                    {(() => {
                      const rvs = selectedProduct.reviews || [];
                      const count = rvs.length;
                      const avg = count > 0 
                        ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                        : 0;

                      return (
                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={`${i < Math.round(avg || 4.8) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-black text-slate-800 font-sans">
                            {count > 0 ? `${avg.toFixed(1)} out of 5.0` : "4.8 out of 5.0"}
                          </span>
                          <span className="text-xs text-slate-300 select-none">•</span>
                          <span 
                            className="text-xs text-blue-600 font-extrabold hover:underline cursor-pointer"
                            onClick={() => {
                              document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            {count > 0 ? `${count} customer reviews` : "12 verified ratings"}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Stock parameters */}
                    <div className="flex flex-wrap items-center gap-6 py-2.5 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">SKU:</span>
                        <span className="text-slate-800 font-bold font-mono">{selectedProduct.sku}</span>
                      </div>
                      <div className="h-4 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">Stock Status:</span>
                        <span className={`font-extrabold flex items-center gap-1 ${selectedProduct.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          <span className={`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></span>
                          {selectedProduct.stock > 0 ? `In stock (${selectedProduct.stock} available)` : "Out of stock / Sold out"}
                        </span>
                      </div>
                    </div>

                    {/* Custom Price box formatted like Amazon */}
                    <div className="py-4 border-y border-slate-100 flex items-center justify-between">
                      <div className="text-left select-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Curated Retail Price</span>
                        {(() => {
                          const displayPriceValue = selectedCountry === "UK"
                            ? selectedProduct.price * (settings.ukExchangeRate ?? 0.79) * (1 + (settings.ukAdjustmentPercent ?? 0.0) / 100.0)
                            : selectedProduct.price;
                          return (
                            <div className="flex items-start mt-0.5">
                              <span className="text-slate-900 font-black text-base">{selectedCountry === "UK" ? "£" : "$"}</span>
                              <span className="text-slate-900 font-black text-3xl">{Math.floor(displayPriceValue)}</span>
                              <span className="text-slate-900 font-black text-lg">.{(displayPriceValue % 1).toFixed(2).split(".")[1] || "00"}</span>
                              <span className="text-slate-500 font-bold text-xs ml-2 align-bottom self-end pb-1.5">{selectedCountry === "UK" ? "GBP" : "USD"}</span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div className="text-emerald-600 font-extrabold">✓ Free Shipping Eligible</div>
                        <div>{selectedCountry === "UK" ? "Fast local transit inside UK" : "Fast local transit inside USA"}</div>
                      </div>
                    </div>

                    {/* Detailed description */}
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Product Profile</h4>
                      <p className="text-slate-600 leading-relaxed font-sans">{selectedProduct.description}</p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Share Product */}
                    <button
                      onClick={() => handleShareProduct(selectedProduct)}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-350 hover:text-blue-650 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-xs font-bold h-11"
                      title="Share product with a unique, direct URL"
                    >
                      <Share2 size={16} />
                      <span>Share Product</span>
                    </button>

                    {/* Save to Wishlist */}
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-xs font-bold h-11 ${
                        buyerUser?.wishlist?.includes(selectedProduct.id)
                          ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                      }`}
                      title="Save to My Wishlist"
                    >
                      <Heart size={16} className={buyerUser?.wishlist?.includes(selectedProduct.id) ? "fill-rose-500 text-rose-500" : ""} />
                      <span>Save Wishlist</span>
                    </button>

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(selectedProduct, 1)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all h-11"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>

                    {/* Instant checkout */}
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct, 1);
                        setCurrentView("checkout");
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs py-3 px-6 rounded-xl cursor-pointer active:scale-95 transition-all text-center border border-yellow-500 h-11 flex items-center justify-center gap-1.5"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM ACTIONS DESK FOR MOBILE DEVICES (Lock viewport bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-250 p-3 flex gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
              <button
                onClick={() => handleAddToCart(selectedProduct, 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <ShoppingBag size={14} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct, 1);
                  setCurrentView("checkout");
                }}
                className="flex-1 bg-yellow-500 text-slate-950 font-extrabold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform border border-yellow-600"
              >
                Buy Now
              </button>
            </div>

            {/* --- RELATED PRODUCTS SECTION (AMAZON-STYLE CAROUSEL GRID) --- */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 font-sans uppercase">
                Customers who viewed this also viewed
              </h3>
              {(() => {
                const relatedList = products
                  .filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
                  .slice(0, 5);
                const finalRelated = relatedList.length > 0 
                  ? relatedList 
                  : products.filter(p => p.id !== selectedProduct.id).slice(0, 5);

                if (finalRelated.length === 0) return <p className="text-xs text-slate-400">No related items found.</p>;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {finalRelated.map((p) => {
                      const rvs = p.reviews || [];
                      const count = rvs.length;
                      const avg = count > 0 
                        ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                        : 0;

                      return (
                        <div 
                          key={p.id}
                          className="group border border-slate-150 rounded-xl p-3 bg-white hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
                          onClick={() => {
                            setSelectedProduct(p);
                            setActiveImgIndex(0);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <div>
                            <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2">
                              <img src={p.images[0]} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 h-8 overflow-hidden hover:text-blue-650 tracking-tight leading-tight mb-1">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 h-3 select-none">
                              <span className="text-[10px] text-amber-500 font-extrabold">★</span>
                              <span className="text-[10px] text-slate-700 font-bold">{avg > 0 ? avg.toFixed(1) : "4.8"}</span>
                              <span className="text-[9px] text-slate-400 font-medium font-mono">({count > 0 ? count : "12"})</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 font-mono">${p.price.toFixed(2)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(p, 1);
                              }}
                              className="text-[10px] font-black text-blue-650 hover:underline cursor-pointer"
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* --- REVIEWS LIST & SUBMISSION FORM --- */}
            <div id="reviews-section" className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4 mb-6">
                Customer Reviews & Ratings Feedback
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Rating percentage details */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center lg:text-left">
                    <span className="text-sm font-bold text-slate-400 block uppercase font-mono tracking-wider">Average Rating</span>
                    {(() => {
                      const rvs = selectedProduct.reviews || [];
                      const count = rvs.length;
                      const avg = count > 0 
                        ? Number((rvs.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
                        : 0;
                      
                      return (
                        <div className="mt-2">
                          <div className="flex items-baseline justify-center lg:justify-start gap-1">
                            <span className="text-4xl font-extrabold text-slate-900 font-sans tracking-tight">{avg.toFixed(1)}</span>
                            <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
                          </div>
                          
                          <div className="flex justify-center lg:justify-start text-amber-400 my-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={18} 
                                className={`${i < Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Bespoke scorecard based on {count} verified global responses</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Rating distribution matrix */}
                  <div className="space-y-2 px-1">
                    {(() => {
                      const rvs = selectedProduct.reviews || [];
                      const totalCount = rvs.length;
                      
                      return [5, 4, 3, 2, 1].map((star) => {
                        const count = rvs.filter(r => Math.round(r.rating) === star).length;
                        const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                        
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                            <span className="w-10 text-right cursor-pointer hover:text-blue-650">{star} star</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="w-8 text-right text-slate-400 font-mono">{pct}%</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right side: Add review form */}
                <div className="lg:col-span-8 bg-slate-50/50 border border-slate-200 rounded-2xl p-6 md:p-7">
                  <h4 className="text-base font-bold text-slate-800 tracking-tight mb-4">
                    Write a Verified Customer Review
                  </h4>

                  {reviewError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl mb-4">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                     <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl mb-4">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. Liam Gallagher"
                          className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm focus:border-blue-500 transition-all text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Star Rating *</label>
                        <div className="flex items-center gap-2 mt-1.5 text-slate-200">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              className="focus:outline-none cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            >
                              <Star
                                size={22}
                                className={`${num <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold text-slate-500 ml-2">({reviewRating} / 5)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Review Title (Optional)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Exceptional craftsmanship"
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Detailed Feedback Comment *</label>
                      <textarea
                        rows={4}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell others what you think! Suction power, material density, build quality..."
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm focus:border-blue-500 transition-all text-slate-800 resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-md shadow-blue-600/10 active:scale-95 transition-all disabled:bg-blue-400"
                    >
                      {isSubmittingReview ? "Submitting Secured Review..." : "Submit Verified Review"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Submitted reviews feed list */}
              <div className="mt-10 border-t border-slate-100 pt-8">
                <h4 className="text-base font-bold text-slate-900 tracking-tight mb-6">
                  Verified Reviews Feed
                </h4>

                {!(selectedProduct.reviews && selectedProduct.reviews.length > 0) ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">No client feedback has been posted yet.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Be the first to share your purchase experience!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedProduct.reviews.map((rev) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={rev.id}
                        className="border-b border-slate-100 last:border-none pb-6 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          {/* User Avatar Initials */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-blue-200 uppercase shrink-0 font-mono">
                            {rev.reviewerName.substring(0, 2)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-800">{rev.reviewerName}</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider">
                                  Verified Purchase
                                </span>
                              </div>
                              <span className="text-[10px] font-medium text-slate-400 font-mono">
                                {new Date(rev.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={`${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                                  />
                                ))}
                              </div>
                              {rev.title && (
                                <span className="text-xs font-bold text-slate-800">{rev.title}</span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- RELATED PRODUCTS / PRODUCT RECOMMENDATIONS --- */}
            {(() => {
              const related = products
                .filter(p => p.id !== selectedProduct.id)
                .sort((a, b) => {
                  const aSame = a.categoryId === selectedProduct.categoryId ? 1 : 0;
                  const bSame = b.categoryId === selectedProduct.categoryId ? 1 : 0;
                  return bSame - aSame;
                })
                .slice(0, 4);

              if (related.length === 0) return null;

              return (
                <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase font-mono pb-3 border-b border-slate-100 mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></span>
                    Verified Product Recommendations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((p) => {
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            setSelectedProduct(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden shadow-sm transition-all duration-350 cursor-pointer flex flex-col justify-between"
                        >
                          <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                            <img
                              src={p.images && p.images[0] ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {p.categoryId === selectedProduct.categoryId && (
                              <span className="absolute top-2 left-2 bg-blue-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Similar Class
                              </span>
                            )}
                          </div>
                          <div className="p-3.5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                            <div>
                              <h4 className="font-extrabold text-[11px] text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {p.name}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60">
                              <span className="text-xs font-black text-slate-900">${p.price.toFixed(2)}</span>
                              <span className="text-[9px] text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">Explore →</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- VIEW: FULL-SCREEN SHOPPING CART PAGE --- */}
        {currentView === "cart" && (
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 select-none text-left">
              <button onClick={() => setCurrentView("catalog")} className="hover:text-blue-600 font-medium">Home</button>
              <span>/</span>
              <span className="text-slate-800 font-bold">Shopping Cart</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              {/* Product list column (Left - 8 cols on desktop) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Free Shipping incentive meter */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {cartSubtotal >= 75 ? (
                      <div>
                        <h4 className="text-sm font-extrabold text-emerald-800">Your order qualifies for FREE Delivery inside {selectedCountry === "UK" ? "UK" : "US"}!</h4>
                        <p className="text-[11px] text-slate-500">Flat-freight courier delivery is complimentary on your current check-out.</p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Add <span className="text-blue-650 font-black">{formatPrice(75 - cartSubtotal)}</span> more to qualify for Free Shipping</h4>
                        <p className="text-[11px] text-slate-500">Everyday {selectedCountry === "UK" ? "UK" : "US"} orders over {formatPrice(75)} unlock entirely free shipping. Carrier average is 2 to 3 days.</p>
                      </div>
                    )}
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${cartSubtotal >= 75 ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${Math.min((cartSubtotal / 75) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Primary Cart box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight font-sans">Shopping Cart</h2>
                    <span className="text-xs text-slate-500 font-mono font-bold">Price</span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
                      <h3 className="text-base font-bold text-slate-800">Your shopping cart is currently empty</h3>
                      <p className="text-slate-400 text-xs mt-1 mb-6">Explore our curated collections of rare tech and lifestyle items.</p>
                      <button
                        onClick={() => setCurrentView("catalog")}
                        className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-850 transition-all cursor-pointer shadow-sm"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-150">
                      {cart.map((item) => (
                        <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-5 first:pt-0 last:pb-0">
                          {/* Image */}
                          <div 
                            className="w-24 h-24 rounded-xl bg-slate-50 overflow-hidden border border-slate-150 shrink-0 p-2 flex items-center justify-center cursor-pointer select-none"
                            onClick={() => {
                              const found = products.find(p => p.id === item.id);
                              if (found) { setSelectedProduct(found); setCurrentView("detail"); }
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          {/* Details & adjustments */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4 items-start">
                                <h3 
                                  className="font-bold text-slate-800 text-sm sm:text-base hover:text-blue-650 cursor-pointer line-clamp-2 leading-tight"
                                  onClick={() => {
                                    const found = products.find(p => p.id === item.id);
                                    if (found) { setSelectedProduct(found); setCurrentView("detail"); }
                                  }}
                                >
                                  {item.name}
                                </h3>
                                <div className="text-right font-sans">
                                  <span className="text-slate-900 font-bold text-sm sm:text-base font-mono">{formatPrice(item.price * item.quantity)}</span>
                                  {item.quantity > 1 && (
                                    <span className="text-slate-400 text-[10px] block font-mono">({formatPrice(item.price)} each)</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 font-bold">
                                <span>SKU: {item.sku}</span>
                                <span className="text-slate-200">|</span>
                                <span className="text-emerald-600 uppercase tracking-wider font-extrabold">In Stock</span>
                              </div>
                            </div>

                            {/* Controls block */}
                            <div className="flex items-center gap-4 mt-4 select-none">
                              {/* Quantity controls */}
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                                  className="p-1 px-2.5 text-slate-500 hover:text-blue-600 font-extrabold hover:bg-slate-200 rounded-l-md cursor-pointer transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-3.5 text-xs font-black text-slate-800 font-mono">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                                  className="p-1 px-2.5 text-slate-500 hover:text-blue-600 font-extrabold hover:bg-slate-200 rounded-r-md cursor-pointer transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <div className="h-4 w-px bg-slate-200"></div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Footer subtotal line inside */}
                      <div className="pt-6 mt-4 text-right text-sm">
                        <span className="text-slate-500">Subtotal ({cartItemCount} items): </span>
                        <span className="text-slice-900 font-black text-base font-sans font-mono">{formatPrice(cartSubtotal)}</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Order checkout summary panel (Right - 4 cols on desktop) */}
              <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase font-mono border-b border-slate-100 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal ({cartItemCount})</span>
                      <span className="font-mono text-slate-800 font-bold">{formatPrice(cartSubtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping & Handling</span>
                      {cartSubtotal >= 75 || cartSubtotal === 0 ? (
                        <span className="text-emerald-600 font-bold font-mono">FREE</span>
                      ) : (
                        <span className="font-mono text-slate-800 font-bold">{formatPrice(6.99)}</span>
                      )}
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Import Tariffs & Taxes</span>
                      <span className="text-slate-400 font-bold">
                        {settings.taxEnabled === false
                          ? "No tax applied"
                          : `${selectedCountry === "UK" ? (settings.ukTaxRate ?? 12) : (settings.usaTaxRate ?? 8)}% ${settings.taxLabel || (selectedCountry === "UK" ? "VAT" : "Tax")} added during checkout`}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-800">Total Estimate:</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 font-mono">
                          {formatPrice(cartSubtotal + (cartSubtotal > 0 && cartSubtotal < 75 ? 6.99 : 0))}
                        </span>
                        <p className="text-[9px] text-slate-400 block mt-0.5 uppercase tracking-wide font-mono">
                          {selectedCountry === "UK" ? "All checkouts are in GBP" : "All checkouts are in USD"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cart.length > 0 ? (
                    <button
                      onClick={() => setCurrentView("checkout")}
                      className="w-full bg-[#f7ca00] hover:bg-[#f5c200] text-slate-950 font-black text-xs py-3.5 rounded-xl cursor-pointer transition-colors text-center border border-[#f2b900] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <span>Proceed to Secure Checkout</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-3.5 rounded-xl cursor-not-allowed text-center border border-slate-200"
                    >
                      Add items to proceed
                    </button>
                  )}

                  {/* Trust badge icons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Guaranteed Safe US Delivery</span>
                    <div className="flex justify-center items-center gap-4 text-slate-300">
                      <span className="text-[8px] font-black uppercase tracking-widest border border-slate-200 px-1 py-0.5 rounded font-mono">SSL Secure</span>
                      <span className="text-[8px] font-black uppercase tracking-widest border border-slate-200 px-1 py-0.5 rounded font-mono">Visa Direct</span>
                      <span className="text-[8px] font-black uppercase tracking-widest border border-slate-200 px-1 py-0.5 rounded font-mono">FedEx Cargo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-slate-700 block">Need assistance?</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contact US flat-freight operations via footer channels at any time.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: GUEST CHECKOUT --- */}
        {currentView === "checkout" && (() => {
          const wd = settings.mobileWalletDiscount !== undefined ? settings.mobileWalletDiscount : 15.0;
          const zd = settings.zelleDiscount !== undefined ? settings.zelleDiscount : 8.0;
          const pd = settings.payoneerDiscount !== undefined ? settings.payoneerDiscount : 0.0;
          const ppd = settings.paypalDiscount !== undefined ? settings.paypalDiscount : 0.0;

          let currentDiscountPercent = 0;
          let discountLabel = "";
          if (selectedPaymentMethod === "wallet") {
            currentDiscountPercent = wd;
            discountLabel = "Mobile Wallet Pay";
          } else if (selectedPaymentMethod === "zelle") {
            currentDiscountPercent = zd;
            discountLabel = "Zelle Transfer";
          } else if (selectedPaymentMethod === "payoneer") {
            currentDiscountPercent = pd;
            discountLabel = "Payoneer Pay";
          } else if (selectedPaymentMethod === "paypal") {
            currentDiscountPercent = ppd;
            discountLabel = "PayPal Pay";
          }

          // Math calculations
          const isUkSelection = selectedCountry === "UK";
          const taxRateVal = isUkSelection ? (settings.ukTaxRate ?? 12.0) / 100.0 : 0.08;
          const previewOriginalTax = Math.round(cartSubtotal * taxRateVal * 100) / 100;
          const previewOriginalShipping = cartSubtotal > 75 || cartSubtotal === 0 ? 0 : 9.99;
          const previewOriginalTotal = Math.round((cartSubtotal + previewOriginalTax + previewOriginalShipping) * 100) / 100;

          const computedDiscountAmount = Math.round(cartSubtotal * (currentDiscountPercent / 100) * 100) / 100;
          const computedPostDiscountSubtotal = Math.round(Math.max(0, cartSubtotal - computedDiscountAmount) * 100) / 100;
          const computedTax = Math.round(computedPostDiscountSubtotal * taxRateVal * 100) / 100;
          const computedShipping = computedPostDiscountSubtotal > 75 || computedPostDiscountSubtotal === 0 ? 0 : 9.99;
          const computedTotal = Math.round((computedPostDiscountSubtotal + computedTax + computedShipping) * 100) / 100;

          return (
            <div>
              <button
                onClick={() => setCurrentView("catalog")}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 bg-white border border-slate-200 px-3 py-2 rounded-xl text-center cursor-pointer shadow-sm"
              >
                <ArrowLeft size={14} /> Back to Catalog
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Checkout shipping info form */}
                <div className="lg:col-span-7 space-y-6">
                  {/* STEP 1: SHIPPING ADDRESS */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6 flex-wrap justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                          {selectedCountry === "UK" ? "UK Region Checkout" : "Shipping Destination"}
                        </h3>
                      </div>
                      {selectedCountry === "UK" && (
                        <div className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest font-mono shrink-0">
                          🇬🇧 UK Region Checkout
                        </div>
                      )}
                    </div>

                    {checkoutError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-xl mb-6">
                        {checkoutError}
                      </div>
                    )}

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">
                            {selectedCountry === "UK" ? "Full Name *" : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={selectedCountry === "UK" ? "e.g. Oliver Jones" : "John Smith"}
                            value={checkoutForm.fullName}
                            onChange={(e) => setCheckoutForm({...checkoutForm, fullName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                          {selectedCountry === "UK" && (
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Use your format standard e.g. First Last</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">Email Address *</label>
                          <input
                            type="type"
                            required
                            placeholder="jsmith@example.com"
                            value={checkoutForm.email}
                            onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder={selectedCountry === "UK" ? "e.g. +44 7911 123456" : "(555) 019-2834"}
                            value={checkoutForm.phone}
                            onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">Country</label>
                          <input
                            type="text"
                            disabled
                            value={selectedCountry === "UK" ? "United Kingdom" : "United States"}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3.5 text-sm text-slate-500 font-medium font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">
                          {selectedCountry === "UK" ? "UK Address *" : "Street Address *"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={selectedCountry === "UK" ? "e.g. 10 Downing Street" : "123 Main Street, Apt 4B"}
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                        />
                        {selectedCountry === "UK" && (
                          <p className="text-[9px] text-slate-400 mt-1 font-mono">Include flat/suite suffix if applicable</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="col-span-2 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-500 block mb-1">City *</label>
                          <input
                            type="text"
                            required
                            placeholder={selectedCountry === "UK" ? "e.g. London" : "Portland"}
                            value={checkoutForm.city}
                            onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">
                            {selectedCountry === "UK" ? "County / Region *" : "State (US) *"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={selectedCountry === "UK" ? "e.g. Greater London" : "OR"}
                            value={checkoutForm.state}
                            onChange={(e) => setCheckoutForm({...checkoutForm, state: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">
                            {selectedCountry === "UK" ? "Postcode *" : "ZIP *"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={selectedCountry === "UK" ? "e.g. SW1A 2AA" : "97201"}
                            value={checkoutForm.zipCode}
                            onChange={(e) => setCheckoutForm({...checkoutForm, zipCode: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* STEP 2: CHOOSE PAYMENT METHOD */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                      <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Select Secure Payment Gateway</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Select your preferred settlement option. Instant automatic discounts are applied based on selected gateways!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* bKash / Nagad Wallet Option */}
                      {(settings.mobileWalletEnabled !== false) && (
                        <div 
                          onClick={() => setSelectedPaymentMethod("wallet")}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${selectedPaymentMethod === "wallet" ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <div className="absolute right-0 top-0 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg font-mono">
                            Save {wd}%
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${selectedPaymentMethod === "wallet" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                            {selectedPaymentMethod === "wallet" && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Smartphone size={15} className="text-pink-600" />
                              <span className="text-xs font-bold text-slate-900">Mobile Wallet Pay</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">Nagad / bKash Balance. Auto-{wd}% Discount applied!</p>
                          </div>
                        </div>
                      )}

                      {/* Zelle Option */}
                      {(settings.zelleEnabled !== false) && (
                        <div 
                          onClick={() => setSelectedPaymentMethod("zelle")}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${selectedPaymentMethod === "zelle" ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <div className="absolute right-0 top-0 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg font-mono">
                            Save {zd}%
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${selectedPaymentMethod === "zelle" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                            {selectedPaymentMethod === "zelle" && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Zap size={15} className="text-purple-600" />
                              <span className="text-xs font-bold text-slate-900">Zelle Instant Pay</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">Secure transfer using email/phone keys. Auto-{zd}% Off!</p>
                          </div>
                        </div>
                      )}

                      {/* Payoneer Option */}
                      {(settings.payoneerEnabled !== false) && (
                        <div 
                          onClick={() => setSelectedPaymentMethod("payoneer")}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${selectedPaymentMethod === "payoneer" ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          {pd > 0 && (
                            <div className="absolute right-0 top-0 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg font-mono">
                              Save {pd}%
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${selectedPaymentMethod === "payoneer" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                            {selectedPaymentMethod === "payoneer" && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Send size={15} className="text-emerald-600" />
                              <span className="text-xs font-bold text-slate-900 font-sans">Payoneer Pay</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">Account balance-based transfer. {pd > 0 ? `Auto-${pd}% Off!` : "Verified direct gateway."}</p>
                          </div>
                        </div>
                      )}

                      {/* PayPal-like Simulated Wallet Option */}
                      {(settings.paypalEnabled !== false) && (
                        <div 
                          onClick={() => setSelectedPaymentMethod("paypal")}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${selectedPaymentMethod === "paypal" ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          {ppd > 0 && (
                            <div className="absolute right-0 top-0 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg font-mono">
                              Save {ppd}%
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${selectedPaymentMethod === "paypal" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                            {selectedPaymentMethod === "paypal" && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Wallet size={15} className="text-blue-600" />
                              <span className="text-xs font-bold text-slate-900">PayPal Pay</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">Simulated balance integration. {ppd > 0 ? `Auto-${ppd}% Off!` : "Direct payment settlement."}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCheckoutSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 active:scale-95 transition-all mt-6 cursor-pointer"
                    >
                      <CheckCircle size={18} />
                      Confirm Order & Proceed to Pay with {selectedPaymentMethod === "wallet" ? "Mobile Wallet Pay" : selectedPaymentMethod === "zelle" ? "Zelle" : selectedPaymentMethod === "payoneer" ? "Payoneer Pay" : "PayPal Pay"}
                    </button>
                  </div>
                </div>

                {/* Order summary info panel */}
                <div className="lg:col-span-5 bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <h3 className="font-extrabold text-base tracking-tight text-white mb-6 uppercase tracking-wider font-mono text-blue-400">Order Manifest Summary</h3>

                  {cart.length === 0 ? (
                    <p className="text-xs text-slate-400">Your cart is empty.</p>
                  ) : (
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 divide-y divide-slate-800">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 pt-3 first:pt-0">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-bold text-slate-200">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-5 space-y-2.5 text-xs text-slate-350 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans">Items Subtotal</span>
                      <span className="text-slate-200">{formatPrice(cartSubtotal)}</span>
                    </div>

                    {computedDiscountAmount > 0 ? (
                      <>
                        <div className="flex justify-between text-yellow-500 font-bold bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/10">
                          <span className="font-sans flex items-center gap-1">🏷️ Gateway Special Discount ({currentDiscountPercent}%)</span>
                          <span>-{formatPrice(computedDiscountAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-400 text-[10px]">
                          <span className="font-sans">Discounted Subtotal</span>
                          <span>{formatPrice(computedPostDiscountSubtotal)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-slate-500">No payment gateway discount applied. Switch gateway to save instantly!</div>
                    )}

                    <div className="flex justify-between">
                      {selectedCountry === "UK" ? (
                        <span className="font-sans flex items-center gap-1">
                          UK VAT ({settings.ukTaxRate ?? 12}%)
                          <HelpCircle size={12} className="text-slate-500" title="Standard United Kingdom Value Added Tax" />
                        </span>
                      ) : (
                        <span className="font-sans flex items-center gap-1">
                          Sales Tax (8%)
                          <HelpCircle size={12} className="text-slate-500" title="Average USA Sales Tax simulated bounds" />
                        </span>
                      )}
                      <span className="text-slate-200">{formatPrice(computedTax)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-sans">Shipping Policy</span>
                      <span className="text-emerald-400 font-bold">
                        {computedShipping === 0 ? "FREE" : formatPrice(computedShipping)}
                      </span>
                    </div>

                    {/* Original vs Final cross-pricing */}
                    {computedDiscountAmount > 0 && (
                      <div className="flex justify-between text-slate-500 line-through text-[11px] pt-1">
                        <span className="font-sans">Original Price Before Discount</span>
                        <span>{formatPrice(previewOriginalTotal)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-800 pt-4 flex justify-between text-base font-black text-white">
                      <span className="font-sans">Payable Total</span>
                      <span className="text-blue-400 font-extrabold">{formatPrice(computedTotal)} {selectedCountry === "UK" ? "GBP" : "USD"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- VIEW: PAYPAL COMPLIANCE SECURED PANEL --- */}
        {currentView === "payment-pending" && activeOrder && (() => {
          const method = activeOrder.paymentMethod || "card";
          
          let title = "USA Secure Checkout Gateway";
          let instructionText = "Please complete manual payment based on your chosen gateway strategy.";
          let detailBoxLabel = "Settlement Instructions";
          let detailBoxValue = "Please transfer the exact sum to our billing department.";
          let inputLabel = "Verify Transfer Reference Transaction ID";
          let inputSub = "Copy-paste your transaction ID or reference number below to let the compliance panel reconcile your transfer.";
          let inputPlaceholder = "Reference reference code (e.g., REF-8231)";

          if (method === "wallet") {
            title = "Mobile Wallet Pay Secure Settlement";
            instructionText = "Please send money or transfer the exact discounted sum using bKash, Nagad or standard mobile wallet to the following recipient info. Specify your Full Name as Reference/Memo.";
            detailBoxLabel = "Recipient Wallet & Instructions";
            detailBoxValue = settings.mobileWalletInfo || "Mobile Wallet Pay: +8801711112222";
            inputLabel = "Verify Mobile Wallet Pay Transaction ID";
            inputSub = "Copy-paste the Transaction ID received via SMS confirmation (e.g. BK-98231-TXN) and upload a payment screenshot.";
            inputPlaceholder = "bKash / Nagad Transaction ID (e.g. BK-98231-TXN)";
          } else if (method === "zelle") {
            title = "Zelle Secure Instant Pay";
            instructionText = "Please execute a Zelle direct transfer using the registered merchant email address below. Put your Order ID as the memo/reference notes.";
            detailBoxLabel = "Zelle Recipient Registration Key";
            detailBoxValue = settings.zelleInfo || "Zelle Email: payzelle@example.com (Recipient: Store Merchant)";
            inputLabel = "Verify Zelle authorization code / reference";
            inputSub = "Provide the exact Zelle receipt code or reference hash (e.g. ZL-83921) to confirm your deposit ledger.";
            inputPlaceholder = "Zelle Transaction reference (e.g. ZL-83921)";
          } else if (method === "payoneer") {
            title = "Payoneer Direct Balance Transfer";
            instructionText = "Provide an account-based balance transfer through your Payoneer platform to our corporate receiver address below.";
            detailBoxLabel = "Account Number, Routing number, Receiver Name";
            detailBoxValue = settings.payoneerInfo || "Account Number: 1234567890, Routing number: 987654321, Receiver Name: RARE USA LLC";
            inputLabel = "Verify Payoneer Settlement Reference ID";
            inputSub = "Paste the payment receipt ref number or transfer authorization code (e.g., PY-38291) to let our admin confirm.";
            inputPlaceholder = "Payoneer Receipt Reference ID (e.g. PY-38291)";
          } else if (method === "paypal") {
            title = "PayPal Automated & Simulated Gateway";
            instructionText = "Complete a manual PayPal direct balance transfer using our certified electronic mailbox and specify your Invoice Number in the payment notes.";
            detailBoxLabel = "Certified PayPal Mailbox";
            detailBoxValue = settings.paypalInfo || settings.paypalEmail || "PayPal Email: paypal@example.com";
            inputLabel = "Verify PayPal TXN Reference ID";
            inputSub = "Copy-paste the PayPal invoice reference code or confirmation tracking hash (e.g. PP-83021-TXID) below.";
            inputPlaceholder = "PayPal TXN reference code (e.g. PP-83021-TXID)";
          } else {
            // card
            title = "Debit or Credit Card Settlement";
            instructionText = "Please initiate your standard card verification. Paste your bank gateway reference token or terminal transaction ID to reconcile payment.";
            detailBoxLabel = "Corporate Settlement Name";
            detailBoxValue = `${settings.businessName || "Store Merchant LLC"} (Card Settlement Gateway)`;
            inputLabel = "Verify Card Transaction Code / Reference";
            inputSub = "Specify your credit authorization code or deposit reference ID (e.g. AUTH-RD9321).";
            inputPlaceholder = "Credit Card auth reference (e.g. AUTH-RD9321)";
          }

          return (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 p-8 text-white text-center">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl">
                  $
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">{title}</h2>
                <p className="text-slate-400 text-xs font-mono mt-1">Invoice ID: {activeOrder.id} • Method: <span className="uppercase text-yellow-500 font-bold">{method}</span></p>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-blue-700 tracking-wider uppercase font-mono">1. Manual payment procedures</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">{detailBoxLabel}</span>
                      <span className="text-xs font-bold text-slate-800 tracking-tight select-all">{detailBoxValue}</span>
                    </div>
                  </div>

                  <div className="bg-blue-600 text-white rounded-xl p-3 flex items-center justify-between text-xs font-mono font-bold shadow-md shadow-blue-600/15">
                    <span>Balance Payable Total</span>
                    <span className="text-sm font-extrabold">${activeOrder.total.toFixed(2)} USD</span>
                  </div>
                </div>

                <form onSubmit={handlePaypalSubmit} className="space-y-4">
                  <div className="border-t border-slate-200 pt-5">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs inline-flex mb-2">2</span>
                    <h4 className="text-xs font-black text-slate-900 tracking-widest uppercase font-mono block">{inputLabel}</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">{inputSub}</p>
                    
                    <input
                      type="text"
                      required
                      placeholder={inputPlaceholder}
                      value={paypalTxId}
                      onChange={(e) => setPaypalTxId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-3 px-4 text-xs font-mono placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-900"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs inline-flex mb-2">3</span>
                    <h4 className="text-xs font-black text-slate-900 tracking-widest uppercase font-mono block">Confirm Transfer Amount Paid</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Provide the exact numeric amount transferred (preloaded with order sum).</p>
                    
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Enter transferred amount (USD)"
                        value={paymentAmountPaid}
                        onChange={(e) => setPaymentAmountPaid(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-3 pl-8 pr-4 text-xs font-mono placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5 font-sans">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs inline-flex mb-2 font-mono">4</span>
                    <h4 className="text-xs font-black text-slate-900 tracking-widest uppercase font-mono block">Upload Payment Screenshot / Transfer Proof</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Browse or drag-and-drop a snapshot image of your successful payment receipt as hard proof of purchase.</p>
                    
                    {!paymentScreenshotBase64 ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-2xl cursor-pointer transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-[11px] font-semibold text-slate-500">Click to upload or drag & drop payment screenshot</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, BMP, or WebP format</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPaymentScreenshotBase64(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-4 relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative">
                          <img 
                            src={paymentScreenshotBase64} 
                            alt="Screenshot overview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 uppercase font-mono tracking-tight flex items-center gap-1">
                            <Image size={11} className="text-emerald-500 shrink-0" />
                            Proof_of_payment.png
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">Converted successfully to secure base64 string</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshotBase64("")}
                          className="w-7 h-7 bg-white hover:bg-rose-50 text-slate-405 hover:text-rose-600 rounded-full border border-slate-200 flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Remove payment screenshot"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPaymentClaim}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed mt-4"
                  >
                    {isSubmittingPaymentClaim ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-slate-550 mr-1" />
                        <span>Processing Order Verification...</span>
                      </>
                    ) : (
                      <span>Confirm Payment & Submit Order</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* --- VIEW: ORDER CONFIRMATION --- */}
        {currentView === "confirmation" && (
          !activeOrder ? (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-md">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">No Active Order Found</h3>
              <p className="text-xs text-slate-500 mt-2">Could not load active checkout receipt data. Please select items from catalog.</p>
              <button 
                onClick={() => setCurrentView("catalog")} 
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer"
              >
                Back to Catalog
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center shadow-xl font-sans relative">
              {/* Green check anim display */}
              <div className="w-20 h-20 bg-emerald-50 text-emerald-550 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle size={44} className="stroke-[2.5]" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Order Placed Successfully!</h2>
              <p className="text-slate-500 text-xs font-mono mt-1 w-full max-w-sm mx-auto">
                Thank you for your purchase, <strong className="text-slate-800">{activeOrder.customer.fullName}</strong>. Your reference verification logs are active.
              </p>

              {/* Status Tracker highlight */}
              <div className="flex items-center gap-2.5 p-3.5 my-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <div className="leading-tight">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Order Queue Status</span>
                  <span className="text-xs font-black text-emerald-800 font-mono">WAITING FOR MANUAL VERIFICATION</span>
                </div>
              </div>

              {/* Mandatory Commercial invoice download utility bar */}
              <div className="my-5 bg-blue-50/70 border border-blue-100 p-4 rounded-2xl flex flex-col items-center justify-between gap-3 sm:flex-row text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-950 leading-tight">Official Commercial Receipt</h4>
                    <p className="text-[10px] text-slate-550 leading-snug">Generate and download standard invoice image for your transaction records.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    downloadInvoiceAsImage(activeOrder);
                    showToast("Commercial receipt downloaded!", "success");
                  }}
                  id="checkout_success_receipt_download"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-0 outline-none"
                >
                  <Download size={13} />
                  <span>Download Transaction Receipt</span>
                </button>
              </div>

              {/* Detailed Transaction card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 shadow-sm mb-6">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 font-mono tracking-widest">Transaction Summary</span>
                  <span className="text-[10px] uppercase font-black text-slate-500 font-mono">{activeOrder.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-slate-150 font-mono text-[11px] leading-relaxed text-slate-600">
                  <div className="space-y-1">
                    <p><span className="font-bold text-slate-450">Order Reference:</span> <strong className="text-slate-900 font-extrabold">{activeOrder.id}</strong></p>
                    <p><span className="font-bold text-slate-450">PayPal Ref ClaimId:</span> <strong className="text-slate-900 font-extrabold">{activeOrder.payPalTransactionId || "N/A"}</strong></p>
                    <p><span className="font-bold text-slate-450">Checkout Time:</span> <strong className="text-slate-900 font-extrabold">{new Date(activeOrder.createdAt).toLocaleString()}</strong></p>
                  </div>
                  <div className="md:border-l md:pl-4 border-slate-200/60 space-y-1">
                    <p><span className="font-bold text-slate-450">Recipient Name:</span> <strong className="text-slate-900 font-extrabold">{activeOrder.customer.fullName}</strong></p>
                    <p className="text-[10px] text-slate-500 font-sans leading-snug">{activeOrder.customer.address}, {activeOrder.customer.city}, {activeOrder.customer.state} {activeOrder.customer.zipCode}</p>
                    <p className="text-[10px] text-slate-500 font-sans">Contact: {activeOrder.customer.phone}</p>
                  </div>
                </div>

                {/* Sub-Items checklist */}
                <div className="bg-white border border-slate-200/65 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/50 px-3 py-1.5 border-b border-slate-200/60 grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase font-mono tracking-widest">
                    <div className="col-span-8">Product Name</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                  </div>
                  <div className="divide-y divide-slate-100 px-3 py-1">
                    {activeOrder.items?.map((item: any, idx: number) => {
                      const nameText = item.productName || item.name || "RARE Item Curation";
                      return (
                        <div key={idx} className="py-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                          <div className="col-span-8 flex items-center gap-2">
                            {item.image && (
                              <img src={item.image} alt={nameText} className="w-8 h-8 rounded-lg border border-slate-100 object-cover shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate leading-snug">{nameText}</p>
                              {item.sku && <p className="text-[9px] text-slate-400 font-mono">SKU: {item.sku}</p>}
                            </div>
                          </div>
                          <div className="col-span-2 text-right font-mono text-slate-500 font-bold">x{item.quantity}</div>
                          <div className="col-span-2 text-right font-mono text-slate-800 font-extrabold">${Number(item.price).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cash breakdowns */}
                <div className="bg-slate-100/30 p-3.5 rounded-xl border border-slate-150 flex flex-col gap-1 text-xs text-slate-600 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span>Items Subtotal</span>
                    <span>${Number(activeOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Standard Sales Tax (8%)</span>
                    <span>${Number(activeOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Shipping Freight Fee</span>
                    <span>${Number(activeOrder.shipping || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2 text-xs text-slate-900 mt-1 uppercase font-semibold">
                    <strong className="font-sans text-slate-700">Verification Amount Total</strong>
                    <strong className="font-mono text-blue-700 font-black">${Number(activeOrder.total || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Action desk buttons buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (buyerToken) {
                      setCurrentView("profile");
                      setProfileTab("orders");
                      setSelectedBuyerOrderDetail(activeOrder);
                      setActiveOrder(null);
                      setPaypalTxId("");
                    } else {
                      showToast("Please sign in to track live orders in your cabinet.", "info");
                      setBuyerAuthMode("login");
                      setCurrentView("auth");
                    }
                  }}
                  id="checkout_success_track_orders"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-6 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={14} />
                  <span>Track Order Live</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView("catalog");
                    setActiveCategory("");
                    setSelectedProduct(null);
                    setActiveOrder(null);
                    setPaypalTxId("");
                  }}
                  id="checkout_success_to_home"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 px-6 rounded-xl cursor-pointer border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* --- VIEW: BUYER LOGIN / REGISTER --- */}
        {currentView === "auth" && (
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                {buyerAuthMode === "login" ? "Sign In to RARE Account" : "Create New Account"}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {buyerAuthMode === "login" 
                  ? "Access your saved wishlists, check order delivery progress, & buy again" 
                  : "Join us today for faster order dispatching, transaction history tracking"
                }
              </p>
            </div>

            {authRedirectMessage && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-805 text-xs flex items-start gap-2.5 shadow-sm">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">{authRedirectMessage}</span>
              </div>
            )}

            {buyerAuthError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{buyerAuthError}</span>
              </div>
            )}

            {buyerAuthSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle size={15} />
                <span>{buyerAuthSuccess}</span>
              </div>
            )}

            {buyerAuthMode === "login" ? (
              <form onSubmit={handleBuyerLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={buyerLoginEmail}
                    onChange={(e) => setBuyerLoginEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50 animate-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={buyerLoginPassword}
                    onChange={(e) => setBuyerLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBuyerAuth}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmittingBuyerAuth ? "Authenticating Session..." : "Secure Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBuyerRegisterSubmit} className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={buyerRegisterName}
                    onChange={(e) => setBuyerRegisterName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={buyerRegisterEmail}
                    onChange={(e) => setBuyerRegisterEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={buyerRegisterPassword}
                    onChange={(e) => setBuyerRegisterPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={buyerRegisterPhone}
                    onChange={(e) => setBuyerRegisterPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Street Address</label>
                  <input
                    type="text"
                    value={buyerRegisterAddress}
                    onChange={(e) => setBuyerRegisterAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      value={buyerRegisterCity}
                      onChange={(e) => setBuyerRegisterCity(e.target.value)}
                      placeholder="New York"
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">State / Province</label>
                    <input
                      type="text"
                      value={buyerRegisterState}
                      onChange={(e) => setBuyerRegisterState(e.target.value)}
                      placeholder="NY"
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={buyerRegisterZip}
                      onChange={(e) => setBuyerRegisterZip(e.target.value)}
                      placeholder="10001"
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Country</label>
                    <input
                      type="text"
                      value={buyerRegisterCountry}
                      onChange={(e) => setBuyerRegisterCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBuyerAuth}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  {isSubmittingBuyerAuth ? "Generating Secure Profile ID..." : "Register Account"}
                </button>
              </form>
            )}

            <div className="border-t border-slate-100 pt-5 mt-5 text-center">
              <p className="text-xs text-slate-500">
                {buyerAuthMode === "login" ? "Don't have an account?" : "Already registered?"}
                <button
                  onClick={() => {
                    setBuyerAuthMode(buyerAuthMode === "login" ? "signup" : "login");
                    setBuyerAuthError("");
                  }}
                  className="text-blue-600 font-bold ml-1.5 hover:underline cursor-pointer"
                >
                  {buyerAuthMode === "login" ? "Create Account Now" : "Sign In to Account"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* --- VIEW: BUYER PROFILE INTERFACE --- */}
        {currentView === "profile" && buyerToken && buyerUser && (
          <div className="py-2">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-lg shadow-slate-900/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-slate-900 to-indigo-900 opacity-90" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {buyerUser.fullName ? buyerUser.fullName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">{buyerUser.fullName}</h1>
                    <p className="text-blue-200 text-xs mt-0.5 font-mono">{buyerUser.email} &bull; Member Since 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView("catalog");
                      setActiveCategory("");
                    }}
                    className="bg-white/10 hover:bg-white/25 text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all border border-white/10 flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} />
                    <span>Continue Shopping</span>
                  </button>
                  <button
                    onClick={handleLogoutBuyer}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Profile Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Tabs */}
              <div className="lg:col-span-1 space-y-2">
                <div className="bg-white rounded-2xl border border-slate-150 p-3 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block px-4 py-1.5 uppercase tracking-wider font-mono">Control Desk</span>
                  <button
                    onClick={() => { setProfileTab("orders"); setSelectedBuyerOrderDetail(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      profileTab === "orders" 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <ShoppingBag size={15} />
                    <span>Order History</span>
                    {buyerOrders.length > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {buyerOrders.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setProfileTab("profile"); setSelectedBuyerOrderDetail(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      profileTab === "profile" 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <User size={15} />
                    <span>Personal Profile</span>
                  </button>

                  <button
                    onClick={() => { setProfileTab("wishlist"); setSelectedBuyerOrderDetail(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      profileTab === "wishlist" 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <Heart size={15} />
                    <span>My Wishlist</span>
                    {buyerUser.wishlist && buyerUser.wishlist.length > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {buyerUser.wishlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setProfileTab("settings"); setSelectedBuyerOrderDetail(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      profileTab === "settings" 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <Settings size={15} />
                    <span>Delivery Address</span>
                  </button>
                </div>

                {/* Notifications Panel */}
                <div className="bg-white rounded-2xl border border-slate-150 p-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    <Info size={13} className="text-blue-500" />
                    <span>Order Updates</span>
                  </h3>
                  <div className="space-y-3">
                    {buyerOrders.slice(0, 2).map((o, idx) => (
                      <div key={o.id} className="text-xs border-b border-slate-105 last:border-0 pb-2.5 last:pb-0">
                        <div className="flex justify-between font-mono mb-1 text-[10px]">
                          <span className="text-slate-400 font-bold">#{o.id}</span>
                          <span className={`${
                            o.status === "Pending" ? "text-amber-600 font-bold" :
                            o.status === "Processing" ? "text-blue-600 font-bold" :
                            o.status === "Shipped" ? "text-indigo-600 font-bold" :
                            "text-emerald-600 font-bold"
                          }`}>{o.status}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Your order for {o.items?.length || 1} product{o.items?.length !== 1 ? "s" : ""} totaling <strong className="text-slate-900">${o.total.toFixed(2)}</strong> has shifted status to <strong>{o.status}</strong>.
                        </p>
                      </div>
                    ))}
                    {buyerOrders.length === 0 && (
                      <p className="text-slate-400 text-xs italic">No dynamic order notifications at this time.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-8 animate-none">
                {/* --- TAB: ORDERS --- */}
                {profileTab === "orders" && !selectedBuyerOrderDetail && (
                  <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Your Checkout Operations</h2>
                        <p className="text-slate-500 text-xs mt-0.5">List of all orders placed using <span className="font-mono">{buyerUser.email}</span></p>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{buyerOrders.length} Order(s)</span>
                    </div>

                    {buyerOrders.length === 0 ? (
                      <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ShoppingBag size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">No checkout history yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Ready to find premium gear? Add products to your cart and checkout safely!</p>
                        <button
                          onClick={() => { setCurrentView("catalog"); setActiveCategory(""); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-lg mt-4 cursor-pointer"
                        >
                          Discover Curated Products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {buyerOrders.map((o) => (
                          <div 
                            key={o.id}
                            onClick={() => setSelectedBuyerOrderDetail(o)}
                            className="border border-slate-150 rounded-2xl p-4 hover:border-blue-400 cursor-pointer transition-all group"
                          >
                            <div className="flex flex-col sm:flex-row justify-between gap-3 font-mono text-xs border-b border-slate-100 pb-3 mb-3">
                              <div className="space-y-1">
                                <p className="text-slate-400 font-bold">Order ID: <span className="text-slate-900 font-black">#{o.id}</span></p>
                                <p className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString()}</p>
                              </div>
                              <div className="sm:text-right space-y-1">
                                <p className="text-slate-900 font-extrabold text-sm">${o.total.toFixed(2)}</p>
                                <div className="flex flex-col gap-1.5 items-start sm:items-end">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Payment:</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                      (o.paymentStatus || "Pending") === "Paid" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                                    }`}>{o.paymentStatus || "Pending"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Order:</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                      o.status === "Pending" ? "bg-amber-150 text-amber-805" :
                                      o.status === "Processing" ? "bg-blue-100 text-blue-800" :
                                      o.status === "Shipped" ? "bg-indigo-100 text-indigo-800" :
                                      "bg-emerald-100 text-emerald-800"
                                    }`}>{o.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {o.items?.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="w-8 h-8 rounded-lg bg-slate-100 border border-white overflow-hidden flex items-center justify-center">
                                      <img src={item.image} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                                <p className="text-slate-500 text-xs">
                                  {o.items?.map((it: any) => it.name).join(", ").slice(0, 48)}
                                  {o.items?.map((it: any) => it.name).join(", ").length > 48 ? "..." : ""}
                                </p>
                              </div>
                              <span className="text-blue-600 text-xs font-bold font-mono group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                View Details <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- SUB-VIEW: DETAILED ORDER DISPLAY WITH TIMELINE TRACKING --- */}
                {profileTab === "orders" && selectedBuyerOrderDetail && (
                  <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                      <button
                        onClick={() => setSelectedBuyerOrderDetail(null)}
                        className="text-slate-500 hover:text-blue-605 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer bg-transparent border-none outline-none"
                      >
                        <ArrowLeft size={14} /> Back to order list
                      </button>

                      <button
                        onClick={() => {
                          downloadInvoiceAsImage(selectedBuyerOrderDetail);
                          showToast("Downloading your commercial invoice...", "success");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                      >
                        <FileCheck size={14} />
                        <span>Download Invoice</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>Order Details:</span>
                          <span className="font-mono text-blue-600 font-extrabold">#{selectedBuyerOrderDetail.id}</span>
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5 font-mono">
                          Placed &bull; {new Date(selectedBuyerOrderDetail.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Payment Status</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black font-sans ${
                            (selectedBuyerOrderDetail.paymentStatus || "Pending") === "Paid" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}>{selectedBuyerOrderDetail.paymentStatus || "Pending"}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Order Status</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black font-sans ${
                            selectedBuyerOrderDetail.status === "Pending" ? "bg-amber-100 text-amber-805 border border-amber-200" :
                            selectedBuyerOrderDetail.status === "Confirmed" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                            selectedBuyerOrderDetail.status === "Processing" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                            selectedBuyerOrderDetail.status === "Shipped" ? "bg-indigo-105 text-indigo-805 border border-indigo-200" :
                            "bg-emerald-105 text-emerald-805 border border-emerald-200"
                          }`}>{selectedBuyerOrderDetail.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline tracking status: Pending → Confirmed → Processing → Shipped → Delivered */}
                    <div className="mb-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span>Delivery Progress Tracker</span>
                      </h3>

                      {/* Interactive Active Highlight Badge */}
                      <div className="flex items-center gap-2.5 p-3 mb-6 bg-white border border-slate-150 rounded-xl font-sans">
                        <span className={`relative flex h-2 w-2`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            selectedBuyerOrderDetail.status === "Pending" ? "bg-slate-400" :
                            selectedBuyerOrderDetail.status === "Confirmed" ? "bg-purple-500" :
                            selectedBuyerOrderDetail.status === "Processing" ? "bg-blue-500" :
                            selectedBuyerOrderDetail.status === "Shipped" ? "bg-orange-500" :
                            "bg-emerald-500"
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            selectedBuyerOrderDetail.status === "Pending" ? "bg-slate-500" :
                            selectedBuyerOrderDetail.status === "Confirmed" ? "bg-purple-600" :
                            selectedBuyerOrderDetail.status === "Processing" ? "bg-blue-600" :
                            selectedBuyerOrderDetail.status === "Shipped" ? "bg-orange-600" :
                            "bg-emerald-600"
                          }`}></span>
                        </span>
                        <span className="text-xs font-bold text-slate-500">Live Status:</span>
                        <span className={`text-xs font-extrabold font-mono ${
                          selectedBuyerOrderDetail.status === "Pending" ? "text-slate-600" :
                          selectedBuyerOrderDetail.status === "Confirmed" ? "text-purple-600" :
                          selectedBuyerOrderDetail.status === "Processing" ? "text-blue-600" :
                          selectedBuyerOrderDetail.status === "Shipped" ? "text-orange-600" :
                          "text-emerald-600"
                        }`}>
                          {selectedBuyerOrderDetail.status === "Pending" ? "Pending Approval (Gray)" :
                           selectedBuyerOrderDetail.status === "Confirmed" ? "Order Confirmed (Purple)" :
                           selectedBuyerOrderDetail.status === "Processing" ? "Processing & Packed (Blue)" :
                           selectedBuyerOrderDetail.status === "Shipped" ? "In Transit, Courier Dispatched (Orange)" :
                           "Arrived & Delivered (Green)"}
                        </span>
                      </div>

                      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 md:gap-0 mt-2">
                        {/* Connecting Line (Base gray line) */}
                        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-200 md:left-[10%] md:right-[10%] md:top-[18px] md:bottom-auto md:w-[80%] md:h-1 z-0" />
                        
                        {/* Highlighted status colored tracks */}
                        <div className={`absolute left-[18px] md:left-[10%] z-0 h-[20%] top-4 w-1 md:h-1 md:top-[18px] md:w-[20%] transition-all duration-300 ${
                          ["Paid", "Processing", "Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) 
                            ? "bg-purple-500" 
                            : "bg-slate-200"
                        }`} />

                        <div className={`absolute left-[18px] md:left-[30%] z-0 h-[20%] top-[20%] w-1 md:h-1 md:top-[18px] md:w-[20%] transition-all duration-300 ${
                          ["Processing", "Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) 
                            ? "bg-blue-500" 
                            : "bg-slate-200"
                        }`} />

                        <div className={`absolute left-[18px] md:left-[50%] z-0 h-[20%] top-[40%] w-1 md:h-1 md:top-[18px] md:w-[20%] transition-all duration-300 ${
                          ["Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) 
                            ? "bg-orange-500" 
                            : "bg-slate-200"
                        }`} />

                        <div className={`absolute left-[18px] md:left-[70%] z-0 h-[20%] top-[60%] w-1 md:h-1 md:top-[18px] md:w-[20%] transition-all duration-300 ${
                          ["Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) 
                            ? "bg-emerald-500" 
                            : "bg-slate-200"
                        }`} />

                        {/* Step 1: Pending (Gray/Slate) */}
                        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all border shadow ${
                            selectedBuyerOrderDetail.status === "Pending"
                              ? "bg-slate-400 text-white border-slate-400 ring-4 ring-slate-100"
                              : "bg-slate-500 text-white border-slate-500"
                          }`}>
                            1
                          </div>
                          <div className="md:mt-2">
                            <p className="text-xs font-bold text-slate-800">Pending</p>
                            <p className="text-[10px] text-slate-400 font-mono">Placed</p>
                          </div>
                        </div>

                        {/* Step 2: Paid (Purple) */}
                        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all border shadow ${
                            selectedBuyerOrderDetail.status === "Paid"
                              ? "bg-purple-600 text-white border-purple-600 ring-4 ring-purple-100"
                              : ["Processing", "Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status)
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-white text-slate-300 border-slate-200"
                          }`}>
                            2
                          </div>
                          <div className="md:mt-2">
                            <p className={`text-xs font-bold ${["Paid", "Processing", "Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) ? "text-slate-800" : "text-slate-400"}`}>Paid</p>
                            <p className="text-[10px] text-slate-400 font-mono">Approved</p>
                          </div>
                        </div>

                        {/* Step 3: Processing (Blue) */}
                        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all border shadow ${
                            selectedBuyerOrderDetail.status === "Processing"
                              ? "bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100"
                              : ["Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-slate-300 border-slate-200"
                          }`}>
                            3
                          </div>
                          <div className="md:mt-2">
                            <p className={`text-xs font-bold ${["Processing", "Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) ? "text-slate-800" : "text-slate-400"}`}>Processing</p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">Packed</p>
                          </div>
                        </div>

                        {/* Step 4: Shipped (Orange) */}
                        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all border shadow ${
                            selectedBuyerOrderDetail.status === "Shipped"
                              ? "bg-orange-500 text-white border-orange-500 ring-4 ring-orange-100"
                              : ["Delivered", "Completed"].includes(selectedBuyerOrderDetail.status)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-slate-300 border-slate-200"
                          }`}>
                            4
                          </div>
                          <div className="md:mt-2">
                            <p className={`text-xs font-bold ${["Shipped", "Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) ? "text-slate-800" : "text-slate-400"}`}>Shipped</p>
                            <p className="text-[10px] text-slate-400 font-mono">In Transit</p>
                          </div>
                        </div>

                        {/* Step 5: Delivered (Green) */}
                        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all border shadow ${
                            ["Delivered", "Completed"].includes(selectedBuyerOrderDetail.status)
                              ? "bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-100"
                              : "bg-white text-slate-300 border-slate-200"
                          }`}>
                            5
                          </div>
                          <div className="md:mt-2">
                            <p className={`text-xs font-bold ${["Delivered", "Completed"].includes(selectedBuyerOrderDetail.status) ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>Delivered</p>
                            <p className="text-[10px] text-slate-400 font-mono font-extrabold">Completed</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                          <User size={13} className="text-slate-400" />
                          <span>Customer Recipient</span>
                        </h4>
                        <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
                          <p className="font-extrabold text-slate-900">{selectedBuyerOrderDetail.customer?.fullName}</p>
                          <p>{selectedBuyerOrderDetail.customer?.email}</p>
                          <p>{selectedBuyerOrderDetail.customer?.phone}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>Shipping Instructions</span>
                        </h4>
                        <div className="text-xs text-slate-705 space-y-0.5 leading-relaxed">
                          <p>{selectedBuyerOrderDetail.customer?.address}</p>
                          <p>{selectedBuyerOrderDetail.customer?.city}, {selectedBuyerOrderDetail.customer?.state} {selectedBuyerOrderDetail.customer?.zipCode}</p>
                          <p>{selectedBuyerOrderDetail.customer?.country}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                          <CreditCard size={13} className="text-slate-400" />
                          <span>Financial Statement</span>
                        </h4>
                        <div className="text-xs text-slate-705 space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-mono font-semibold">${selectedBuyerOrderDetail.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Tax (8%):</span>
                            <span className="font-mono">${selectedBuyerOrderDetail.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Shipping / Handle:</span>
                            <span className="font-mono">${selectedBuyerOrderDetail.shipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900 font-extrabold text-xs">
                            <span>Grand Total:</span>
                            <span className="font-mono">${selectedBuyerOrderDetail.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product lines item checklist */}
                    <div className="border border-slate-150 rounded-2xl overflow-hidden mb-6">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 flex items-center justify-between text-xs font-bold text-slate-600 font-mono">
                        <span>Checkout Line Items</span>
                        <span>Quantity & Sum</span>
                      </div>
                      <div className="divide-y divide-slate-105">
                        {selectedBuyerOrderDetail.items?.map((item: any, idx: number) => {
                          const originalProductObj = products.find(p => p.id === item.id);
                          return (
                            <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border overflow-hidden flex items-center justify-center shrink-0">
                                  <img src={item.image} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                                </div>
                              </div>
                              <div className="text-right space-y-1.5">
                                <p className="font-mono font-bold text-slate-800">
                                  {item.quantity} &times; ${item.price.toFixed(2)}
                                </p>
                                {originalProductObj && (
                                  <button
                                    onClick={() => {
                                      handleAddToCart(originalProductObj, 1);
                                      showToast(`${originalProductObj.name} added back to cart!`, "success");
                                    }}
                                    className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-205 font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-0.5 cursor-pointer ml-auto"
                                  >
                                    <ShoppingBag size={10} /> Buy Again
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PayPal verify details */}
                    {(selectedBuyerOrderDetail.payPalTransactionId || selectedBuyerOrderDetail.paymentScreenshot) && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
                        <h4 className="font-bold text-slate-805 mb-2 font-mono uppercase tracking-wider text-[10px]">Payment Verification Check</h4>
                        {selectedBuyerOrderDetail.payPalTransactionId && (
                          <p className="mb-2">PayPal Transaction ID: <strong className="font-mono">{selectedBuyerOrderDetail.payPalTransactionId}</strong></p>
                        )}
                        {selectedBuyerOrderDetail.paymentScreenshot && (
                          <div>
                            <p className="text-slate-500 mb-1.5 text-[11px]">Submitted manual wire capture screen receipt (click thumb to expand):</p>
                            <img 
                              onClick={() => {
                                if (typeof selectedBuyerOrderDetail.paymentScreenshot === "string") {
                                  setActiveScreenshotZoom(selectedBuyerOrderDetail.paymentScreenshot);
                                }
                              }}
                              src={selectedBuyerOrderDetail.paymentScreenshot} 
                              alt="Manual transaction screenshot verification" 
                              className="max-h-20 max-w-sm rounded-lg border border-slate-205 cursor-zoom-in hover:brightness-95 hover:border-blue-500 hover:shadow-md transition-all object-contain" 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: PROFILE PERSONAL INFO --- */}
                {profileTab === "profile" && (
                  <form onSubmit={handleUpdateBuyerProfile} className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Manage identity parameters & delivery shipping defaults</p>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full font-mono">User ID: {buyerUser.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-505 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={buyerUser.fullName || ""}
                          onChange={(e) => setBuyerUser({ ...buyerUser, fullName: e.target.value })}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-505 uppercase tracking-wider mb-1">Email Address (Secured Lock)</label>
                        <input
                          type="email"
                          disabled
                          value={buyerUser.email || ""}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 pointer-events-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-505 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={buyerUser.phone || ""}
                          onChange={(e) => setBuyerUser({ ...buyerUser, phone: e.target.value })}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl cursor-pointer shadow-sm transition-all"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                )}

                {/* --- TAB: WISHLIST --- */}
                {profileTab === "wishlist" && (
                  <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8">
                    <div className="pb-4 border-b border-slate-100 mb-6 font-sans">
                      <h2 className="text-lg font-bold text-slate-900">Your Saved Wishlist</h2>
                      <p className="text-slate-505 text-xs mt-0.5">Curate your next transaction cycles</p>
                    </div>

                    {!buyerUser.wishlist || buyerUser.wishlist.length === 0 ? (
                      <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="w-12 h-12 bg-rose-50 text-rose-455 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Heart size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-805">Your wishlist is empty</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Found products you like? Click the heart icon on any detail page to save it here!</p>
                        <button
                          onClick={() => { setCurrentView("catalog"); setActiveCategory(""); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-lg mt-4 cursor-pointer"
                        >
                          Find Premium Items
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {buyerUser.wishlist.map((prodId: string) => {
                          const prod = products.find(p => p.id === prodId);
                          if (!prod) return null;
                          return (
                            <div key={prod.id} className="border border-slate-150 rounded-2xl p-4 flex gap-4 hover:border-slate-350 transition-all">
                              <div className="w-16 h-16 bg-slate-50 border rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={prod.images[0]} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">{prod.name}</h3>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>
                                  <p className="text-xs font-black text-slate-905 font-mono mt-1">${prod.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => handleAddToCart(prod, 1)}
                                    className="bg-blue-600 hover:bg-blue-705 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <ShoppingBag size={11} /> Move to Cart
                                  </button>
                                  <button
                                    onClick={() => toggleWishlist(prod.id)}
                                    className="text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 p-1.5 rounded-lg transition-all cursor-pointer"
                                    title="Remove from lists"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: SETTINGS (DELIVERY ADDRESS) --- */}
                {profileTab === "settings" && (
                  <form onSubmit={handleUpdateBuyerProfile} className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-900">Default Shipping Address</h2>
                      <p className="text-slate-550 text-xs mt-0.5">Control destination and postal routing parameters</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Street Address</label>
                        <input
                          type="text"
                          value={buyerUser.address || ""}
                          onChange={(e) => setBuyerUser({ ...buyerUser, address: e.target.value })}
                          placeholder="Street details and apartments"
                          className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                          <input
                            type="text"
                            value={buyerUser.city || ""}
                            onChange={(e) => setBuyerUser({ ...buyerUser, city: e.target.value })}
                            placeholder="New York"
                            className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">State / Province</label>
                          <input
                            type="text"
                            value={buyerUser.state || ""}
                            onChange={(e) => setBuyerUser({ ...buyerUser, state: e.target.value })}
                            placeholder="NY"
                            className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-505 uppercase tracking-wider mb-1">Zip / Postal Code</label>
                          <input
                            type="text"
                            value={buyerUser.zipCode || buyerUser.zipcode || ""}
                            onChange={(e) => setBuyerUser({ ...buyerUser, zipCode: e.target.value })}
                            placeholder="10001"
                            className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-505 uppercase tracking-wider mb-1">Country</label>
                          <input
                            type="text"
                            value={buyerUser.country || ""}
                            onChange={(e) => setBuyerUser({ ...buyerUser, country: e.target.value })}
                            placeholder="United States"
                            className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl cursor-pointer shadow-sm transition-all"
                    >
                      Save Shipping Settings
                    </button>
                  </form>
                )}

                {/* --- RECENTLY VIEWED PRODUCTS BLOCK (ALWAYS VISIBLE AT BOTTOM) --- */}
                {recentlyViewed.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-500" />
                      <span>Recently Viewed Products</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 animate-none">
                      {recentlyViewed.map((prod) => (
                        <div 
                          key={prod.id}
                          onClick={() => { setSelectedProduct(prod); setCurrentView("detail"); }}
                          className="cursor-pointer group text-center space-y-1.5"
                        >
                          <div className="aspect-square bg-slate-50 border rounded-xl overflow-hidden flex items-center justify-center p-2 group-hover:shadow group-hover:border-blue-400 transition-all">
                            <img src={prod.images[0]} referrerPolicy="no-referrer" alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight">{prod.name}</p>
                            <p className="text-[10px] text-slate-505 font-mono font-bold leading-none mt-0.5">${prod.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: ADMIN LOGIN --- */}
        {currentView === "admin-login" && (
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-slate-900 text-white border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Admin System Authentication</h2>
              <p className="text-slate-400 text-xs font-mono mt-1">Identity & Secure Database Authentication</p>
            </div>

            {adminError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl mb-4 font-semibold">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Administrative Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter administrative username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Security Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-colors"
              >
                Authenticate Verification Credentials
              </button>
            </form>
          </div>
        )}

        {/* --- VIEW: SECURE ADMIN WORKSPACE PANEL --- */}
        {currentView === "admin-dashboard" && adminToken && (
          <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl text-slate-200 flex flex-col min-h-[600px]">
            {/* Admin layout Header */}
            <div className="bg-slate-900/95 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/10">
                  A
                </div>
                <div>
                  <h2 className="font-black tracking-tight text-white text-base">Backend Administrative Console</h2>
                  <p className="text-[10px] text-slate-400 font-mono">STATEMENTS AUDIT QUEUES • USA MARKET</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAdminActiveTab("dashboard")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setAdminActiveTab("orders")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Orders ({orders.length})
                </button>
                <button
                  onClick={() => setAdminActiveTab("products")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Catalog ({products.length})
                </button>
                <button
                  onClick={() => setAdminActiveTab("categories")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setAdminActiveTab("settings")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Payment Settings
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="p-1 px-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-rose-700 transition-colors ml-4 cursor-pointer"
                  title="Admin Logout Session"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>

            {/* Dashboard metrics statistics dashboard panel */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-900/45 bg-slate-900/20">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-900/80">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono tracking-wider">Total Sales Revenue</span>
                <span className="text-xl md:text-2xl font-black text-blue-400 font-sans tracking-tight">${adminRevenueSet.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">FROM APPROVED ORDERS</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-900/80">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono tracking-wider">Verification Queues</span>
                <span className="text-xl md:text-2xl font-black text-amber-500 font-sans tracking-tight">{adminWaitingOrders.length}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">TRANSFERS NEED RECONCILIATION</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-900/80">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono tracking-wider">Pending Orders</span>
                <span className="text-xl md:text-2xl font-black text-slate-400 font-sans tracking-tight">{adminPendingOrders.length}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">AWAITING TXID PAYMENT FILES</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-900/80">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono tracking-wider">Active Inventory Goods</span>
                <span className="text-xl md:text-2xl font-black text-emerald-400 font-sans tracking-tight">{products.length}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">LINE PRODUCTS REGISTERED</span>
              </div>
            </div>

            {/* Admin tab viewport */}
            <div className="p-6 flex-1 overflow-auto bg-slate-950">
              
              {/* TAB: DASHBOARD OVERVIEW */}
              {adminActiveTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Stats Summary Bento Box Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Related analytical card */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10 text-blue-500">
                        <ShoppingBag size={52} />
                      </div>
                      <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">Store Products Range</h4>
                      <div className="text-3xl font-black text-white mt-2">{products.length} Items</div>
                      <p className="text-[10px] text-slate-400 mt-1">Live active commodities registered in categories</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10 text-purple-500">
                        <DollarSign size={52} />
                      </div>
                      <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">Total Store Traffic / Orders</h4>
                      <div className="text-3xl font-black text-white mt-2">{orders.length} Orders</div>
                      <p className="text-[10px] text-slate-400 mt-1">Accumulated customer reservations checkout logs</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10 text-emerald-500">
                        <DollarSign size={52} />
                      </div>
                      <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">Accumulated Gross Income</h4>
                      <div className="text-3xl font-black text-emerald-400 mt-2">${adminRevenueSet.toFixed(2)}</div>
                      <p className="text-[10px] text-slate-400 mt-1">Sum value of all validated Completed orders</p>
                    </div>
                  </div>

                  {/* Dual Grid block: Recent Orders & Stock alert logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Recent Orders (Latest 5 orders) */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-905 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <h4 className="text-xs font-black tracking-wider uppercase font-mono text-slate-400">Most Recent Order Log Entries</h4>
                        <button 
                          onClick={() => setAdminActiveTab("orders")}
                          className="text-[10px] text-blue-400 hover:underline font-bold"
                        >
                          View All Orders ({orders.length}) →
                        </button>
                      </div>

                      {orders.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 text-xs font-mono">
                          No recent checkout entries generated inside the base.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-900">
                          {orders.slice().reverse().slice(0, 5).map((o) => (
                            <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-extrabold text-blue-400">{o.id}</span>
                                  <span className="text-[10px] text-slate-500">({new Date(o.createdAt).toLocaleDateString()})</span>
                                </div>
                                <div className="text-[11px] text-slate-300 font-bold mt-0.5">{o.customer.fullName} • {o.customer.email}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Total: <span className="font-extrabold text-white">${o.total.toFixed(2)} USD</span></div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-800 font-mono text-[9px] text-slate-300 outline-none rounded p-1 font-bold cursor-pointer hover:border-blue-500 transition-colors"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="text-[9px] bg-rose-950/20 text-rose-500 hover:text-white hover:bg-rose-600 px-1.5 py-1 rounded border border-rose-500/10 hover:border-rose-600 transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Low Inventory alert tracker card */}
                    <div className="bg-slate-900/40 border border-slate-905 rounded-2xl p-5 space-y-4">
                      <div className="pb-2 border-b border-slate-800">
                        <h4 className="text-xs font-black tracking-wider uppercase font-mono text-slate-400">Low Stock Warning Logs</h4>
                      </div>

                      {(() => {
                        const lowStock = products.filter(p => p.stock <= 5);
                        if (lowStock.length === 0) {
                          return (
                            <div className="p-8 text-center text-slate-600 text-[10px] leading-relaxed font-mono">
                              ✓ All registered products currently contain healthy inventory stocking assets.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                            {lowStock.map(p => (
                              <div 
                                key={p.id} 
                                onClick={() => startEditProduct(p)}
                                className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl hover:border-amber-500 cursor-pointer transition-all flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-extrabold text-[11px] text-slate-200 block line-clamp-1">{p.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">{p.sku}</span>
                                </div>
                                <span className="bg-amber-950/20 text-amber-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 whitespace-nowrap">
                                  {p.stock} Left
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ORDERS LIST */}
              {adminActiveTab === "orders" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <h3 className="font-bold text-sm uppercase tracking-wider font-mono text-slate-400">Merchant Orders Tracker Ledger</h3>
                    <span className="text-xs text-slate-500">{orders.length} orders total</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      No merchant orders registered inside the database yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-900">
                      {orders.map((o) => (
                        <div key={o.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-mono text-xs">{o.id}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(o.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200">{o.customer.fullName} • {o.customer.email}</div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                Method: <span className="text-yellow-400">{o.paymentMethod || "card"}</span>
                              </span>
                              {o.discountAmount !== undefined && Number(o.discountAmount) > 0 && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                                  Saved: -${Number(o.discountAmount).toFixed(2)}
                                </span>
                              )}
                              {o.originalTotal !== undefined && Number(o.originalTotal) !== o.total && (
                                <span className="text-[9px] font-bold text-slate-500 font-mono">
                                  Original: ${Number(o.originalTotal).toFixed(0)}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              Address: <span className="font-mono">{o.customer.address}, {o.customer.city}, {o.customer.state} {o.customer.zipCode}</span>
                            </div>
                            {o.payPalTransactionId && (
                              <div className="space-y-1 mt-1">
                                <div className="text-[10px] text-blue-400 font-mono">
                                  Payment reference code: <span className="font-bold select-all bg-blue-950 px-1.5 py-0.5 border border-blue-900 rounded">{o.payPalTransactionId}</span>
                                </div>
                                {o.amountPaid !== undefined && (
                                  <div className="text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                                    <span>Amount Paid:</span>
                                    <span className="font-bold text-white bg-slate-900 px-1 py-0.5 border border-slate-800 rounded">
                                      ${Number(o.amountPaid).toFixed(2)} USD
                                    </span>
                                    {Math.abs(Number(o.amountPaid) - o.total) > 0.01 ? (
                                      <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded animate-pulse" title="Amount does not match Payable order total!">
                                        (mismatch with total: ${o.total.toFixed(2)})
                                      </span>
                                    ) : (
                                      <span className="text-emerald-400 text-[9px]">(Matched Total)</span>
                                    )}
                                  </div>
                                )}
                                {o.paymentScreenshot && (
                                  <div className="pt-1 select-none flex flex-col items-start gap-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Proof Screenshot:</span>
                                    <div className="relative group/thumb">
                                      <img 
                                        src={o.paymentScreenshot} 
                                        alt={`Receipt Proof ${o.id}`} 
                                        className="h-14 w-auto rounded border border-slate-800 hover:border-blue-500 cursor-pointer lg:hover:scale-105 active:scale-95 transition-all bg-slate-900 object-contain"
                                        title="Click to zoom proof"
                                        onClick={() => setActiveScreenshotZoom(o.paymentScreenshot || null)}
                                      />
                                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover/thumb:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                        Click to Zoom
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-xs text-slate-500 block uppercase font-mono">Total sum</span>
                              <span className="font-bold font-sans text-blue-400 text-sm tracking-tight">${o.total.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              {/* Status Select dropdown */}
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-slate-900 border border-slate-700 font-mono text-[10px] text-slate-200 outline-none rounded p-1 font-bold cursor-pointer hover:border-blue-500 transition-colors"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rejected">Rejected</option>
                              </select>

                              {/* Delete Order permanently */}
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-1 text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded transition-colors text-[10px] font-bold font-mono px-2.5 cursor-pointer text-center"
                                title="Delete Order Permanently"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRODUCTS MANAGEMENT */}
              {adminActiveTab === "products" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <h3 className="font-bold text-sm uppercase tracking-wider font-mono text-slate-400">Catalogue Asset Inventory</h3>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          price: "",
                          description: "",
                          categoryId: categories[0]?.id || "",
                          images: "",
                          stock: "20",
                          sku: ""
                        });
                        setShowProductModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      New Product Document
                    </button>
                  </div>

                  {/* Add/Edit Product Modal Panel overlay inline for clean focus */}
                  {showProductModal && (
                    <form onSubmit={handleSaveProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 font-mono">
                        {editingProduct ? `Modify Product Profile: ${editingProduct.id}` : "Initialize New Product Profile"}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Product Title</label>
                          <input
                            type="text"
                            required
                            placeholder="AeroPro Headset"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Category Links</label>
                          <select
                            value={productForm.categoryId}
                            onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          >
                            <option value="">No Category Link</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Price (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="149.99"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Active Stock Items</label>
                          <input
                            type="number"
                            required
                            value={productForm.stock}
                            onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Product SKU Identification</label>
                          <input
                            type="text"
                            placeholder="AP-ANC-90"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Product Images (Upload Directly from Computer)</label>
                        
                        {/* Previews / Gallery */}
                        {productFormImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {productFormImages.map((imgUrl, i) => (
                              <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
                                <img src={imgUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="preview" />
                                <button
                                  type="button"
                                  onClick={() => setProductFormImages(prev => prev.filter((_, idx) => idx !== i))}
                                  className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 font-extrabold text-[10px] transition-opacity cursor-pointer"
                                  title="Remove image"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-800 hover:border-blue-500 hover:bg-slate-900/40 rounded-2xl cursor-pointer transition-all">
                          <div className="flex flex-col items-center justify-center text-center px-4 font-sans">
                            <Upload className="w-6 h-6 text-slate-500 mb-1" />
                            <p className="text-[10px] font-semibold text-slate-400">Click to upload product image from computer</p>
                            <p className="text-[8px] text-slate-500 mt-0.5 font-mono">PNG, JPG, BMP, or WebP</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            className="hidden" 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach((file: any) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setProductFormImages(prev => [...prev, reader.result as string]);
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Detailed Description Profile</label>
                        <textarea
                          rows={3}
                          placeholder="Enter details..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-sans"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2 justify-end">
                        <button
                          type="button"
                          onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-755 cursor-pointer"
                        >
                          Cancel Operations
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {editingProduct ? "Update Product" : "Publish Product Stock"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* General products table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300 divide-y divide-slate-900 border border-slate-900/60 rounded-xl overflow-hidden">
                      <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase font-bold">
                        <tr>
                          <th className="px-4 py-3">Catalog Item Name</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Inventory Stock</th>
                          <th className="px-4 py-3">Category ID</th>
                          <th className="px-4 py-3 text-right">Settings Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/40 bg-slate-950">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{p.sku}</td>
                            <td className="px-4 py-3 font-mono">${p.price.toFixed(2)}</td>
                            <td className={`px-4 py-3 font-bold ${p.stock <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>{p.stock}</td>
                            <td className="px-4 py-3 text-slate-500">
                              {categories.find(c => c.id === p.categoryId)?.name || "Uncategorized"}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => startEditProduct(p)}
                                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: CATEGORIES MANAGEMENT */}
              {adminActiveTab === "categories" && (
                <div className="space-y-6">
                  {/* Category Builder */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-xs font-black uppercase text-blue-400 font-mono mb-4">Initialize New Category Block</h4>
                    <form onSubmit={handleCreateCategory} className="flex gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Electronics, Sports Outdoors, Apparels..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Publish Brand Category
                      </button>
                    </form>
                  </div>

                  {editingCategory && (
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-amber-500 font-mono mb-4">Update Category Profile: {editingCategory.name}</h4>
                      <form onSubmit={handleUpdateCategoryName} className="flex gap-3">
                        <input
                          type="text"
                          required
                          value={categoryInputName}
                          onChange={(e) => setCategoryInputName(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => { setEditingCategory(null); setCategoryInputName(""); }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-755 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Modify Title
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Active categories layout list */}
                  <div className="bg-slate-950/40 rounded-2xl border border-slate-900">
                    <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between text-xs font-mono uppercase font-bold text-slate-400">
                      <span>Category Class Name</span>
                      <span>Settings & Maintenance</span>
                    </div>

                    <div className="divide-y divide-slate-900/50">
                      {categories.map((c) => (
                        <div key={c.id} className="px-4 py-3 flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{c.name} <span className="text-[10px] text-slate-500 font-mono">({c.slug})</span></span>
                          <div className="space-x-3">
                            <button
                              onClick={() => { setEditingCategory(c); setCategoryInputName(c.name); }}
                              className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="text-rose-500 hover:text-rose-450 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SECURED PAYPAL SETTINGS */}
              {adminActiveTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-8 max-w-3xl">
                  <div>
                    <h3 className="text-sm font-black tracking-widest text-blue-400 font-mono uppercase pb-2 border-b border-slate-800">Payment Settings & Gateways</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Configure global parameters, accounts info, tax policies, and gateway discounts.</p>
                  </div>

                  {/* SECTION 1: GLOBAL DETAILS & TAX MANAGEMENT */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">1. General & Tax Settings</h4>
                    <div className="max-w-md">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Business Name Entity</label>
                      <input
                        type="text"
                        required
                        value={settings.businessName}
                        onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                      />
                    </div>

                    {/* Tax Management Card */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Percent size={14} className="text-amber-500" />
                          Tax Management Controls
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="taxEnabled"
                            checked={settings.taxEnabled !== false}
                            onChange={(e) => setSettings({...settings, taxEnabled: e.target.checked})}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="taxEnabled" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">Enable Tax globally</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">USA Tax Percentage (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={settings.usaTaxRate !== undefined ? settings.usaTaxRate : 8.0}
                            onChange={(e) => setSettings({...settings, usaTaxRate: parseFloat(e.target.value) || 0.0})}
                            disabled={settings.taxEnabled === false}
                            className={`w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono ${settings.taxEnabled === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">UK Tax Percentage (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={settings.ukTaxRate !== undefined ? settings.ukTaxRate : 12.0}
                            onChange={(e) => setSettings({...settings, ukTaxRate: parseFloat(e.target.value) || 0.0})}
                            disabled={settings.taxEnabled === false}
                            className={`w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono ${settings.taxEnabled === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Custom Tax Label</label>
                          <input
                            type="text"
                            required
                            placeholder="Tax / VAT / Sales Tax"
                            value={settings.taxLabel || "Tax"}
                            onChange={(e) => setSettings({...settings, taxLabel: e.target.value})}
                            disabled={settings.taxEnabled === false}
                            className={`w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white ${settings.taxEnabled === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: INDIVIDUAL GATEWAYS */}
                  <div className="space-y-6 pt-4 border-t border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">2. Structured Payment Methods & Discounts</h4>
                    
                    {/* GATEWAY A: MOBILE WALLETS */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Smartphone size={14} className="text-pink-500" />
                          Mobile Wallet Setup (Nagad / bKash Style)
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="mobileWalletEnabled"
                            checked={settings.mobileWalletEnabled !== false}
                            onChange={(e) => setSettings({...settings, mobileWalletEnabled: e.target.checked})}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="mobileWalletEnabled" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">Active</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Wallet Recipient Account Numbers / Instructions</label>
                          <input
                            type="text"
                            value={settings.mobileWalletInfo || ""}
                            onChange={(e) => setSettings({...settings, mobileWalletInfo: e.target.value})}
                            placeholder="bKash / Nagad Wallet: +8801711112222"
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-505 uppercase block mb-1">Instant discount (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.mobileWalletDiscount !== undefined ? settings.mobileWalletDiscount : 15.0}
                            onChange={(e) => setSettings({...settings, mobileWalletDiscount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <div className="flex items-center gap-1.5 mt-2">
                            <input
                              type="checkbox"
                              id="mobileWalletDiscountEnabled"
                              checked={settings.mobileWalletDiscountEnabled !== false}
                              onChange={(e) => setSettings({...settings, mobileWalletDiscountEnabled: e.target.checked})}
                              className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="mobileWalletDiscountEnabled" className="text-[9px] text-slate-400 font-bold select-none cursor-pointer">Apply Discount</label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Custom Message / instructions display (Above payment UI)</label>
                        <textarea
                          rows={2}
                          value={settings.mobileWalletMessage || ""}
                          onChange={(e) => setSettings({...settings, mobileWalletMessage: e.target.value})}
                          placeholder="Let buyers know bKash / Nagad guidelines, limits or instructions here..."
                          className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-sans"
                        />
                      </div>
                    </div>

                    {/* GATEWAY B: ZELLE */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Zap size={14} className="text-purple-500" />
                          Zelle Transfer Setup
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="zelleEnabled"
                            checked={settings.zelleEnabled !== false}
                            onChange={(e) => setSettings({...settings, zelleEnabled: e.target.checked})}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="zelleEnabled" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">Active</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Zelle registered email / Recipient</label>
                          <input
                            type="text"
                            value={settings.zelleInfo || ""}
                            onChange={(e) => setSettings({...settings, zelleInfo: e.target.value})}
                            placeholder="Zelle Deposit Account Details"
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Instant discount (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.zelleDiscount !== undefined ? settings.zelleDiscount : 8.0}
                            onChange={(e) => setSettings({...settings, zelleDiscount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <div className="flex items-center gap-1.5 mt-2">
                            <input
                              type="checkbox"
                              id="zelleDiscountEnabled"
                              checked={settings.zelleDiscountEnabled !== false}
                              onChange={(e) => setSettings({...settings, zelleDiscountEnabled: e.target.checked})}
                              className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="zelleDiscountEnabled" className="text-[9px] text-slate-400 font-bold select-none cursor-pointer">Apply Discount</label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Custom Message / instructions display (Above payment UI)</label>
                        <textarea
                          rows={2}
                          value={settings.zelleMessage || ""}
                          onChange={(e) => setSettings({...settings, zelleMessage: e.target.value})}
                          placeholder="Enter your custom Zelle transaction message here..."
                          className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-sans"
                        />
                      </div>
                    </div>

                    {/* GATEWAY C: PAYONEER */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Send size={14} className="text-emerald-500" />
                          Payoneer Balance Transfer Setup
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="payoneerEnabled"
                            checked={settings.payoneerEnabled !== false}
                            onChange={(e) => setSettings({...settings, payoneerEnabled: e.target.checked})}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="payoneerEnabled" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">Active</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Payoneer Details (Account Number, Routing number, Receiver Name)</label>
                          <input
                            type="text"
                            value={settings.payoneerInfo || ""}
                            onChange={(e) => setSettings({...settings, payoneerInfo: e.target.value})}
                            placeholder="Account Number: ..., Routing number: ..., Receiver Name: ..."
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Configured discount (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.payoneerDiscount !== undefined ? settings.payoneerDiscount : 0.0}
                            onChange={(e) => setSettings({...settings, payoneerDiscount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <div className="flex items-center gap-1.5 mt-2">
                            <input
                              type="checkbox"
                              id="payoneerDiscountEnabled"
                              checked={settings.payoneerDiscountEnabled !== false}
                              onChange={(e) => setSettings({...settings, payoneerDiscountEnabled: e.target.checked})}
                              className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="payoneerDiscountEnabled" className="text-[9px] text-slate-400 font-bold select-none cursor-pointer">Apply Discount</label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Custom Message / instructions display (Above payment UI)</label>
                        <textarea
                          rows={2}
                          value={settings.payoneerMessage || ""}
                          onChange={(e) => setSettings({...settings, payoneerMessage: e.target.value})}
                          placeholder="Enter account guidelines or steps for Payoneer transfer here..."
                          className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-sans"
                        />
                      </div>
                    </div>

                    {/* GATEWAY D: PAYPAL SIMULATOR */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Wallet size={14} className="text-blue-500" />
                          PayPal Secure Wallet Setup
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="paypalEnabled"
                            checked={settings.paypalEnabled !== false}
                            onChange={(e) => setSettings({...settings, paypalEnabled: e.target.checked, isEnabled: e.target.checked})}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="paypalEnabled" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">Active</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">PayPal primary receiver email account</label>
                          <input
                            type="text"
                            value={settings.paypalInfo || ""}
                            onChange={(e) => setSettings({...settings, paypalInfo: e.target.value, paypalEmail: e.target.value})}
                            placeholder="PayPal Primary Inbox Account"
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Configured discount (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.paypalDiscount !== undefined ? settings.paypalDiscount : 0.0}
                            onChange={(e) => setSettings({...settings, paypalDiscount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <div className="flex items-center gap-1.5 mt-2">
                            <input
                              type="checkbox"
                              id="paypalDiscountEnabled"
                              checked={settings.paypalDiscountEnabled !== false}
                              onChange={(e) => setSettings({...settings, paypalDiscountEnabled: e.target.checked})}
                              className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="paypalDiscountEnabled" className="text-[9px] text-slate-400 font-bold select-none cursor-pointer">Apply Discount</label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Custom Message / instructions display (Above payment UI)</label>
                        <textarea
                          rows={2}
                          value={settings.paypalMessage || ""}
                          onChange={(e) => setSettings({...settings, paypalMessage: e.target.value})}
                          placeholder="Describe PayPal simulated transfer instructions or notice here..."
                          className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-sans"
                        />
                      </div>
                    </div>

                    {/* SECTION 3: UK REGIONAL BUSINESS RULES */}
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-4 pt-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Globe size={14} className="text-blue-500" />
                          UK Country Mode Regional Settings
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono bg-blue-900/40 px-2 py-0.5 rounded-full">ACTIVE CONTROLS</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">UK Exchange Rate (1 USD to GBP)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={settings.ukExchangeRate !== undefined ? settings.ukExchangeRate : 0.79}
                            onChange={(e) => setSettings({...settings, ukExchangeRate: parseFloat(e.target.value) || 0.79})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <p className="text-[9px] text-slate-500 mt-1">Multiplies the base USD price. Default: 0.79</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">UK Value Added Tax (VAT %)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.ukTaxRate !== undefined ? settings.ukTaxRate : 12.0}
                            onChange={(e) => setSettings({...settings, ukTaxRate: parseFloat(e.target.value) || 12.0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <p className="text-[9px] text-slate-500 mt-1">Applied to converted totals. Default: 12%</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">UK Price Markup / Adjustment (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.ukAdjustmentPercent !== undefined ? settings.ukAdjustmentPercent : 0.0}
                            onChange={(e) => setSettings({...settings, ukAdjustmentPercent: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                          />
                          <p className="text-[9px] text-slate-500 mt-1">Optional price markup/discount. Default: 0%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-blue-650/15 cursor-pointer transition-all active:scale-95"
                    >
                      Commit Configuration Parameters
                    </button>
                  </div>
                </form>
              )}



            </div>
          </div>
        )}

      </main>

      {/* 3. RESPONSIVE CHECKOUT SHOPPING BASKET DRAWER BAR */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Shopping Basket panel body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between"
              id="sidebar_cart_container"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-blue-600" size={20} />
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Your Shopping Basket</h3>
                  <span className="text-xs font-medium text-slate-400">({cartItemCount} items)</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Cart checklist lists */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <ShoppingBag size={44} className="text-slate-300" />
                    <p className="text-sm font-semibold">Your shopping basket is empty</p>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Add premium items from our catalogue to proceed with secure checkouts.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 first:pt-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.sku}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Quantity control ticks */}
                          <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50 scale-95 origin-left">
                            <button
                              onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                              className="p-1 px-2.5 text-slate-500 hover:text-blue-600 font-bold hover:bg-slate-100 rounded-l-lg cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-800 font-mono">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                              className="p-1 px-2.5 text-slate-500 hover:text-blue-600 font-bold hover:bg-slate-100 rounded-r-lg cursor-pointer"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="text-sm font-black text-slate-900 font-mono">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer footer metrics calculations */}
              <div className="p-6 border-t border-slate-150 bg-slate-50 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-slate-800 font-bold">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedCountry === "UK" ? "Shipping Policy (UK Region)" : "Shipping Policy (US Flat)"}</span>
                    <span className="font-semibold text-slate-800">
                      {cartSubtotal > 75 || cartSubtotal === 0 ? (
                        <span className="text-emerald-600 font-bold tracking-wide uppercase font-mono text-[10px]">
                          {selectedCountry === "UK" ? "FREE SHIPPING OVER £60" : "FREE SHIPPING OVER $75"}
                        </span>
                      ) : (
                        formatPrice(checkoutShipping)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Payable Total</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{formatPrice(checkoutTotal)}</span>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView("checkout");
                  }}
                  className={`w-full text-center text-white py-3 rounded-2xl font-bold font-sans text-xs shadow-md transition-all ${
                    cart.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/10 cursor-pointer active:scale-95"
                  }`}
                >
                  Proceed to Contact Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. FOOTER CREDITS INFO */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-12 border-t border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <ShoppingBag className="text-blue-400" size={16} />
                <span className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">RARE</span>
              </div>
              <p className="text-slate-500 text-xs mt-1.5">Premium curated consumer electronics, apparel collections, designer homeware, and robust outdoor gear.</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <button 
                onClick={() => { setCurrentView("catalog"); setActiveCategory(""); }}
                className="hover:text-white transition-colors"
              >
                Catalog Shop
              </button>
              <button 
                onClick={() => {
                  if (adminToken) {
                    setCurrentView("admin-dashboard");
                  } else {
                    setCurrentView("admin-login");
                  }
                }}
                className="hover:text-white transition-colors"
              >
                Access Control
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <span>&copy; {new Date().getFullYear()} RARE. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* 5. LIGHTBOX ZOOM SCREENSHOT MODAL */}
      <AnimatePresence>
        {activeScreenshotZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveScreenshotZoom(null)}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
              <button
                onClick={() => setActiveScreenshotZoom(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer"
                title="Close Zoom View"
              >
                <X size={20} />
              </button>
              <img 
                src={activeScreenshotZoom} 
                alt="Zoomed Payment Screenshot Proof" 
                className="max-w-full max-h-[80vh] rounded-2xl border border-white/15 object-contain shadow-2xl select-none"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-white/60 font-mono text-center text-xs mt-4">
                Payment verification proof snapshot. Use browser zoom if further inspection resolution is required.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. SYSTEM-WIDE TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[110] max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 flex items-start gap-3"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/15 text-emerald-400" :
              toast.type === "error" ? "bg-rose-500/15 text-rose-400" :
              "bg-blue-500/15 text-blue-400"
            }`}>
              {toast.type === "success" ? <CheckCircle size={18} /> : 
               toast.type === "error" ? <AlertCircle size={18} /> : 
               <Info size={18} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase font-mono block">
                System Announcement
              </span>
              <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. IFRAME-SAFE BACK-OFFICE CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmConfig?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[105] flex items-center justify-center p-4"
            onClick={() => setConfirmConfig(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 bg-rose-500/15 text-rose-400 rounded-xl">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    {confirmConfig.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">System Core Action authorization</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {confirmConfig.message}
              </p>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmConfig(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {confirmConfig.cancelText || "Dismiss"}
                </button>
                <button
                  type="button"
                  onClick={confirmConfig.onConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {confirmConfig.confirmText || "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCountryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6"
            >
              <div className="space-y-2">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl">
                  <span role="img" aria-label="Globe">🌐</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Where are you from?</h3>
                <p className="text-xs text-slate-500 leading-normal max-w-xs mx-auto">
                  Select your country to unlock local currency pricing, native tax guidelines, and regional courier support.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {/* USA Option */}
                <button
                  type="button"
                  onClick={() => {
                    changeSelectedCountry("US");
                    setShowCountryModal(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedCountry === "US"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-slate-200 hover:border-blue-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-3xl" role="img" aria-label="US Flag">🇺🇸</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-sans text-slate-900">United States (USA)</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {settings.taxEnabled === false
                        ? "USD ($) • No Tax Applied"
                        : `USD ($) • ${settings.usaTaxRate ?? 8}% ${settings.taxLabel || "Sales Tax"}`}
                    </p>
                  </div>
                  {selectedCountry === "US" && (
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">✓</span>
                  )}
                </button>
 
                {/* UK Option */}
                <button
                  type="button"
                  onClick={() => {
                    changeSelectedCountry("UK");
                    setShowCountryModal(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedCountry === "UK"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-slate-200 hover:border-blue-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-3xl" role="img" aria-label="UK Flag">🇬🇧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-sans text-slate-900">United Kingdom (UK)</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {settings.taxEnabled === false
                        ? "GBP (£) • No Tax Applied"
                        : `GBP (£) • ${settings.ukTaxRate ?? 12}% ${settings.taxLabel || "Value Added Tax"}`}
                    </p>
                  </div>
                  {selectedCountry === "UK" && (
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">✓</span>
                  )}
                </button>
              </div>

              {/* Dismiss button ONLY if user already had a valid value */}
              {localStorage.getItem("selected-country") && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCountryModal(false)}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-1.5 cursor-pointer"
                  >
                    Keep current selection
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar styled like Amazon/Walmart */}
      {currentView !== "detail" && currentView !== "checkout" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-6 py-2 flex items-center justify-between pb-safe-bottom pb-2">
          
          {/* Home shortcut */}
          <button
            onClick={() => {
              setCurrentView("catalog");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent border-none ${
              currentView === "catalog" && !activeCategory ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <Home size={18} />
            <span className="text-[9px] font-black tracking-tight font-sans">Home</span>
          </button>

          {/* Search trigger */}
          <button
            onClick={() => {
              setCurrentView("catalog");
              setActiveCategory("");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => {
                const searchInput = document.getElementById("buyer_search_input");
                if (searchInput) {
                  searchInput.focus();
                }
              }, 250);
            }}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent border-none text-slate-400"
          >
            <Search size={18} />
            <span className="text-[9px] font-black tracking-tight font-sans">Search</span>
          </button>

          {/* Cart shortcut */}
          <button
            onClick={() => {
              setCurrentView("cart");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent border-none ${
              currentView === "cart" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-black tracking-tight font-sans">Basket</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow-500 text-slate-950 font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Profile / Account shortcut */}
          <button
            onClick={() => {
              if (buyerToken) {
                setCurrentView("profile");
              } else {
                setCurrentView("auth");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent border-none ${
              currentView === "profile" || currentView === "auth" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <User size={18} />
            <span className="text-[9px] font-black tracking-tight font-sans">Profile</span>
          </button>

        </div>
      )}
    </div>
  );
}
