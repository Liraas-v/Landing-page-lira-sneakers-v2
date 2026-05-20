import React, { memo } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bell,
  BellOff,
  Camera,
  Check,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Clock,
  Crown,
  Droplets,
  ExternalLink,
  Eye,
  EyeOff,
  Gem,
  Gift,
  HelpCircle,
  Home,
  Info,
  Layers,
  List,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Medal,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Phone,
  Plus,
  Shield,
  ShoppingCart,
  Moon,
  Sun,
  Tag,
  Trophy,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";

const ICON_MAP = {
  "alert-circle": AlertCircle,
  "arrow-left": ArrowLeft,
  award: Award,
  bell: Bell,
  "bell-off": BellOff,
  camera: Camera,
  check: Check,
  "check-check": CheckCheck,
  "check-circle": CheckCircle,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  clock: Clock,
  crown: Crown,
  droplets: Droplets,
  "external-link": ExternalLink,
  eye: Eye,
  "eye-off": EyeOff,
  gem: Gem,
  gift: Gift,
  "help-circle": HelpCircle,
  home: Home,
  info: Info,
  instagram: Camera,
  layers: Layers,
  list: List,
  "loader-2": Loader2,
  lock: Lock,
  "log-in": LogIn,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  medal: Medal,
  menu: Menu,
  "message-circle": MessageCircle,
  package: Package,
  palette: Palette,
  phone: Phone,
  plus: Plus,
  shield: Shield,
  "shopping-cart": ShoppingCart,
  moon: Moon,
  sun: Sun,
  tag: Tag,
  trophy: Trophy,
  "trash-2": Trash2,
  user: User,
  "user-plus": UserPlus,
  x: X,
};

const Icon = memo(function Icon({
  name,
  size = 20,
  className = "",
  style = {},
}) {
  const LucideIcon = ICON_MAP[name];
  if (!LucideIcon) {
    if (import.meta.env.DEV)
      console.warn(`[Icon] Ícone não mapeado: "${name}"`);
    return (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-block",
          background: "#f87171",
          borderRadius: 3,
          flexShrink: 0,
          ...style,
        }}
        title={`Ícone ausente: ${name}`}
        aria-hidden="true"
      />
    );
  }
  return (
    <LucideIcon
      size={size}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
});

export default Icon;
