export const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    y: [50, 0],
    transition: { staggerChildren: 0.1 },
  },
};

export const variantItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
