import { motion } from "framer-motion";

interface ToggleProps {
  size: "small" | "medium" | "large";
  isOn: boolean;
  onToggle: (value: boolean) => void;
}

const toggleVariants: Record<ToggleProps["size"], string> = {
  "small": "w-[60px] h-[24px]",
  "medium": "w-[75px] h-[30px]",
  "large": "w-[100px] h-[40px]",
};

export default function Toggle({ size, isOn, onToggle }: ToggleProps) {
  const componentSize = toggleVariants[size];

  return (
    <motion.div
      onClick={() => onToggle(!isOn)}
      layout
      transition={{
        type: "spring",
        duration: 1,
        bounce: 0.2,
      }}
      animate={{
        backgroundColor: isOn ? "#5ec899" : "#e2e1e1",
      }}
      className={`
        button
        ${componentSize}
        bg-bg-primary
        rounded-full
        cursor-pointer
        flex 
        ${isOn ? "justify-end" : "justify-start"}
      `}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          duration: 0.8,
          bounce: 0.3,
        }}
        animate={{
          backgroundColor: isOn ? "#4ca37c" : " #aaa",
        }}
        className="
          aspect-square h-[100%]
          rounded-full
        "
      />
    </motion.div>
  );
}

// USAGE
// "use client";
// import { useState } from "react";
// import Toggle from "@/components/Toggle/Toggle";
// const Test = () => {
//   const [isOn, setIsOn] = useState(false);
//
//   return (
//     <div
//       className={`
//         flex justify-center items-center h-screen gap-4
//         ${isOn ? "bg-gray-300" : "bg-green-400"}
//       `}
//     >
//       <Toggle size="small" isOn={isOn} onToggle={setIsOn} />
//       <Toggle size="medium" isOn={!isOn} onToggle={setIsOn} /> if you want to test the off state
//       <Toggle size="large" isOn={isOn} onToggle={setIsOn} />
//     </div>
//   );
// };
// export default Test;
  