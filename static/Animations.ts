export const containerVariants = {
  hidden: { opacity: 0.1, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    y: [0, 0],
    transition: { staggerChildren: 0.1, duration: 0.4 },
  },
};

export const variantItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
