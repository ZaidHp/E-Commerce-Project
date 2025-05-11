import React, { useEffect, useRef } from "react";
import styles from "../../pages/landing.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import imgTwo from "../../assets/landingpageImages/imgTwo.jpg";
import { FaMap } from "react-icons/fa";

const HeroSection = () => {
  
  gsap.registerPlugin(ScrollTrigger);

  const featuresContainerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const titleElements = titleRef.current.querySelectorAll('span');


    gsap.to(titleElements, {
      textShadow: "0 0 20px #000, 0 0 40px #000, 0 0 60px #111",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      // stagger: 0.01,
    }); 

    if (!isMobile) {
      // Desktop animations

        gsap.to(`.${styles.title}, .${styles.wrapperImg}, .${styles.images} , .${styles.heroContainer}`, {
              y: -200,
              opacity: 0,
              scrollTrigger: {
                trigger: featuresContainerRef.current,
                scroller: "body",
                start: "top 92%",
                end: "top 45%",
                scrub: 1,
                // markers: true,
              },
              stagger: 0.08,
        
            });


        const tl = gsap.timeline();
        tl.to(`.${styles.title} h1 span`, {  
          y: -60,
          opacity: 1,
          stagger: 0.09,
          duration: 0.4,
          delay: 5,
        });
        tl.to(`.${styles.menu} , .${styles.heroContainer}`, {
          opacity:1,
          y:-20,
          stagger:0.3,
        });
                

      gsap.to(`.${styles.box}`, {
        y: "-100%",
        ease: "expo.inOut",
        duration: 2.4,
        delay: 1,
      });

      gsap.from(`.${styles.img}`, {
        scale: 2,
        ease: "expo.inOut",
        duration: 4,
        delay: 0,
      });

      gsap.to(`.${styles.wrapperImg}`, {
        width: 350,
        height: 450,
        ease: "expo.inOut",
        duration: 2.4,
        delay: 3.6,
      });

      gsap.from(`.${styles.img}`, {
        opacity: 0,
        ease: "expo.inOut",
        duration: 0.4,
        delay: 3.4,
      });

      gsap.to(`.${styles.left}`, {
        x: -310,
        rotation: -10,
        ease: "expo.inOut",
        duration: 2,
        delay: 3.8,
        opacity: 0.5,
      });

      gsap.to(`.${styles.right}`, {
        x: 310,
        rotation: 10,
        ease: "expo.inOut",
        duration: 2,
        delay: 3.8,
        opacity: 0.5,
      });

      
    } else {
      // Mobile animations

      const tl = gsap.timeline();

      gsap.to(`.${styles.box}`, {
        y: "-100%",
        ease: "expo.inOut",
        duration: 4,
        delay: 0,
      });


      gsap.from(`.${styles.img}`, {
        scale: 2,
        ease: "expo.inOut",
        duration: 4,
        delay: 0,
      });


      // gsap.from(`.${styles.wrapperImg}`, {
      //   opacity: 0.8,
      //   width: "85%",
      //   scale: 2,
      //   height: "100vh",
      //   ease: "expo.inOut",
        
      // });


      gsap.to(`.${styles.wrapperImg}`, {
        y: "60%",
        opacity: 1,
        width: "85%",
        scale: 1.2,
        height: "24rem",
        ease: "expo.inOut",
        duration: 2.4,
        delay: 3.6,
      });


      gsap.from(`.${styles.img}`, {
        opacity: 0,
        ease: "expo.inOut",
        duration: 0.4,
        delay: 3.4,
      });


      gsap.to(`.${styles.title} h1 span`, {  
        y: -60,
        z: 0,
        duration: 1.4,
        opacity: 1,
        ease: "expo.inOut",
          stagger:0.08,
          delay:4.2,
      });

      

      gsap.to(`.${styles.left}`, {
        x: -80,
        scale: 1.4,
        rotation: -10,
        ease: "expo.inOut",
        duration: 2,
        delay: 4.4,
        opacity: 0.6,
      });

      gsap.to(`.${styles.right}`, {
        x: 80,
        scale: 1.4,
        z: 100,
        rotation: 10,
        ease: "expo.inOut",
        duration: 2,
        delay: 4.4,
        opacity: 0.6,
      });

      tl.to(`.${styles.menu} , .${styles.heroContainer}`, {
        opacity: 1,
        y: -30,
        ease: "expo.inOut",
        duration: 2,
        stagger: 0.34,
        delay: 4.7,
      });
    }
    

  }, []);

  return (
    <>
    <div className={styles.container} >
      <nav className={styles.menu}>
        {/* <div className={`${styles.menuLeft} ${styles.menuItem}`}>
          <span className={styles.menuLink}>Login</span>
          <span className={styles.menuLink}>Contact</span>
        </div> */}
        {/* <div className={`${styles.menuCenter} ${styles.menuItem}`}>
          <div className={styles.brandLogo}>Fabr IQ</div>
        </div> */}
        {/* <div className={`${styles.menuRight} ${styles.menuItem}`}>
          <div className={styles.searchIcon}>
            <FaMap name="search-sharp"></FaMap>
          </div>
        </div> */}
      </nav>
      <div className={styles.images}>
        <div className={`${styles.left} ${styles.img}`} ></div>
        <div className={`${styles.right} ${styles.img}`} ></div>
      </div>
      <div className={styles.heroImage}>
        <div className={styles.wrapperImg}>
          <div className={styles.box}></div>
          <div>
            <img className={styles.image} src={imgTwo}/>
          </div>
        </div>
      </div>
      <div className={styles.header}>
      <div className={`${styles.title}`} ref={titleRef}>
      <h1><span></span><span>F</span><span>a</span><span>b</span><span>r</span><span>I</span><span>Q</span></h1>
      </div>
    </div>
      <div className={styles.heroContainer}>
        <div className={styles.sidebarText}>003</div>
        <div className={styles.projects}>About</div>
      </div>
      <div className={styles.featuresContainer} ref={featuresContainerRef}>

      </div>
    </div>
    </>
  );
};

export default HeroSection;
