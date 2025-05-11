import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";

import config from "../config/config";
import { uploadImage, downloadCanvasToImage, reader } from '../config/helpers';
import axios from 'axios';

import state from "../store";
import { download, stylishShirt } from "../assets";
// import { downloadCanvasToImage, reader } from "../config/helpers";
import { fadeAnimation, slideAnimation } from "../config/motion";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import AddProductForm from "../business_components/AddProductForm";
import AIOrderComponent from "../customer_components/AIOrderComponent";

import {
  CustomButton,
  Tab,
  ColorPicker,
  FilePicker,
  AIPicker,
} from "../components";

const Customizer = ({nextStage}) => {
  const snap = useSnapshot(state);
  const editorRef = useRef(null);

  const [file, setFile] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatingImg, setGeneratingImg] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: true,
  });


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        setActiveEditorTab(""); // Close the editor tabs
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  //show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />;
      case "filepicker":
        return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case "aipicker":
        return (
          <AIPicker
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };
 
  const handleSubmit = async (type) => {
  if (!prompt) return alert("Please enter a prompt");

  try {
    setGeneratingImg(true);
    
    const response = await fetch("http://localhost:8080/api/v1/dalle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Image generation failed");
    }

    const data = await response.json();
    const imageUrl = `data:image/png;base64,${data.photo}`;
    
    // Store the generated image in state
    handleDecals(type, imageUrl);
    
    // Return the image data for potential immediate use
    return {
      file: null, // We don't have a File object here
      preview: imageUrl
    };
    
  } catch (error) {
    console.error("Image generation failed:", error);
    alert(error.message.includes("loading") 
      ? "Model is loading, please try again in 20 seconds"
      : error.message || "Something went wrong!");
    return null;
  } finally {
    setGeneratingImg(false);
    setActiveEditorTab("");
  }
};

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.filterTab]) {
      handleActiveFiltertab(decalType.filterTab)
    }
  }

  const handleActiveFiltertab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    //after setting the state, activeFilterTab will be updated
    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab("");
    });
  };

  const handleNextStage = async () => {
     if (nextStage === 'Add Product') {
      setShowAddProduct(true);
      return;
    }

    if (nextStage === 'Order Now') {
      setShowOrderModal(true);
      return;
    }

    try {
      const productData = {
        color: snap.color,
        isLogoTexture: snap.isLogoTexture,
        isFullTexture: snap.isFullTexture,
        logoDecal: null,
        fullDecal: null,
        fullProductImage: null
      };
  
      // Upload logo if enabled
      if (snap.isLogoTexture && snap.logoDecal) {
        productData.logoDecal = await uploadImage(snap.logoDecal, 'logos');
      }
  
      // Upload full texture if enabled
      if (snap.isFullTexture && snap.fullDecal) {
        productData.fullDecal = await uploadImage(snap.fullDecal, 'textures');
      }
  
      // Save full product image if in "Add Product" stage
       productData.fullProductImage = await downloadCanvasToImage('product');
      // if (nextStage === 'Add Product' || nextStage === 'Order Now') {
        // productData.fullProductImage = await downloadCanvasToImage('product');
      // }
  
      console.log('Product data ready:', productData);
      alert('Images saved successfully! Paths logged in console.');
  
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error saving images: ' + error.message);
    }
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs"
                ref={editorRef}
              >
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => {
                      setActiveEditorTab(tab.name);
                    }}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => {
                state.intro = true;
              }}
              customStyle="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>
          <motion.div
            className="filtertabs-container"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFiltertab(tab.name)}
              />
            ))}
          </motion.div>
          <CustomButton
        key={"nextStage"}
        type="filled"
        title={nextStage}
        handleClick={ () => handleNextStage()}
        customStyle="w-fit px-4 py-2.5 font-bold text-sm absolute bottom-5 right-5 z-10"
      />
      {showAddProduct && (
            <AddProductForm onClose={() => setShowAddProduct(false)} />
          )}

      {showOrderModal && (
          <AIOrderComponent 
            onClose={() => setShowOrderModal(false)} 
          />
        )}
        </>
      )}
      
    </AnimatePresence>
  );
};

export default Customizer;
