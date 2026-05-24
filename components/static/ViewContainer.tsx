import { containerVariants } from "@/static/Animations";
import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewContainerI {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ViewContainer(props: ViewContainerI) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={props.title}
        variants={containerVariants}
        className="general-view-settings"
      >
        <div className="view-container">
          <div className="view-box">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {props.title}
            </h1>
            <p className="mt-1 text-sm md:text-base text-muted-foreground">
              {props.description}
            </p>
          </div>
          <span className="w-full border-b border-border"></span>
          <div className="view-box flex flex-1">{props.children}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
