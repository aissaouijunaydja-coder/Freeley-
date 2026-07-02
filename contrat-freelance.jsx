import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabase.js";

/* ── LOGO FREELEY (base64) ── */
const FREELEY_LOGO = "data:image/jpeg;base64,/9j/4QEZRXhpZgAATU0AKgAAAAgABQEAAAMAAAABAScAAAEBAAMAAAABAcgAAAExAAIAAAAmAAAASodpAAQAAAABAAAAcAESAAQAAAABAAAAAAAAAABBbmRyb2lkIEJQNEEuMjUxMjA1LjAwNi5TOTM4QlhYUzlDWkUxAAAEkAMAAgAAABQAAACmkpEAAgAAAAQwMDEAkBEAAgAAAAcAAAC6kggABAAAAAEAAAAAAAAAADIwMjY6MDY6MTMgMTM6MTI6MzUAKzAyOjAwAAADAQAAAwAAAAEBJwAAATEAAgAAACYAAADrAQEAAwAAAAEByAAAAAAAAEFuZHJvaWQgQlA0QS4yNTEyMDUuMDA2LlM5MzhCWFhTOUNaRTEA/+AAEEpGSUYAAQEAAAEAAQAA/+ICGElDQ19QUk9GSUxFAAEBAAACCAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAABkclhZWgAAAVQAAAAUZ1hZWgAAAWgAAAAUYlhZWgAAAXwAAAAUd3RwdAAAAZAAAAAUclRSQwAAAaQAAAAoZ1RSQwAAAaQAAAAoYlRSQwAAAaQAAAAoY3BydAAAAcwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAABGAAAAHABEAGkAcwBwAGwAYQB5ACAAUAAzACAARwBhAG0AdQB0ACAAdwBpAHQAaAAgAHMAUgBHAEIAIABUAHIAYQBuAHMAZgBlAHIAAFhZWiAAAAAAAACD3QAAPb7///+7WFlaIAAAAAAAAEq/AACxNwAACrlYWVogAAAAAAAAKDsAABELAADIy1hZWiAAAAAAAAD21gABAAAAANMtcGFyYQAAAAAABAAAAAJmZgAA8qcAAA1ZAAAT0AAAClsAAAAAAAAAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAcgBJwMBIgACEQEDEQH/xAAeAAEAAQUBAQEBAAAAAAAAAAAACgYHCAkLAwUEAv/EADsQAAEEAwABBAECAwQIBwEBAAQAAgMFAQYHCAkREhMUChUWISIjMUGBFxgkMlFxofAlNGGRscHR8Sb/xAAdAQEAAgIDAQEAAAAAAAAAAAAABAUGBwECAwkI/8QAOREAAQQBAwMBBgUDAwMFAAAAAQACAxEhBAUxEkFRBhMiMmFxgQcUkaHwCEKxI1LBctHxFVNikrL/2gAMAwEAAhEDEQA/AJ5CIijoiIiIiIiIiJ/P/D2/z/7/AJf8/wDBERERERERERERERERERERERERP+X/AF/7/wCn+P8AciIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIn+Gc5z/w/+8f5N9v/AG9sf8c5RERET+ec/wB/9/8Ax/8A3/8Aff8Ayx/NERERERERERERERERPf8Aw/z/AO//AK/z9v8AFERP8c/9P+X/AK/4e/8A8/5J/n/l/wAv8f8Ar/8Az/EiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJ/3/19/wD5/n/z/miIn/8Af8v7vb/h/f8Az9v7/wDH+5EREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREXIaXfCCb8C0sDkoixY7L5x+HPj0ZPV9s8n+Gc1vB/yMzaztHS9VC27GBYpJiPjqLbOXZZfrxF9ecRVT/cmSAVuXFFDQy6zOtfqO/S15lFJjX+o9A7VYRfV9lXyXle0Ol/tQyy8ZjtelR821on4ZHFEl/FvZ/qMsw4n/Fg1vLVzoNs3HU0YNJqHh2A4RvojxdUO3P0UaTV6WMkPniaRQILheaxWSeboLe0iiC9E/Vqc0Bknh5N4Y71tEToWNFsOidcoNEkhIkHnzJLPT61pvRmkwil4GwweO8EkPHfO5xNbLHG2XCTeP1XHmdaSWTOe+PnjXpohM8mK12yjdL3m0rApB5Y24eYDvWk1x1nAQ6ImE2SlhA9oswT087ZPm22i9J73MAfyvswRYL3sHjJHVeLoirxgHlQ371oG4EpdmqaHeRxdAj79qPlT1UXOL2f9Sp6pV+Y0mp3zkukQN+XvXavxzVyw3+8Q8ePk/dM7fYY+D4ZJ2/A5n9qWQ13ygaLCNU3Jf1MvqRaTulPd9Lt+Zdp04Y2N97o9tz7WtHlta78cuCcWu2nSKutsKU1zyYTBz5w7mCAwAP7q0sF54B0s+iN2DC64CQ2+gPd1k490W2ifuBYyeV4jftEXBtSAEgdRbgA1k54HddE5Fjl4leUHNfMvx65p5IcmmNzpvSaWSwgrbZojL3XLivOKp9i1bYIQSTBYLrXbwA+qOwOVOLO4ZhgU5ARYxE2RqxKWJ8MkkUremSJxa9p5aWnP+P2Vy1zXta5hBY5oc1w4IIBGPmMfJERF0XZERERERERERERERERERERERERERERERERERERERERERWf7Z5BcQ8b9Ol3/vXVdF5Lp8czRY7zedirqEc412MZZXVMJczC7m0kb7vjrKkc2wljw6RgzmMc7HpHFJM9rYmOkc401rWlxcewFWLPjN2ur3sY3qc8NaBZLiBV4sX24V4EUWvy9/VG+MPNhtj1XxJ55tnkBvIU0gFVvW2hv0HirpMxubm2E/IK/wBJO0whkt+ElTLq+lDWcWPtA2lkLo5nxpfJv10/Ut8n5Dwrfv8AZ8c04yds8ei+O48/JasTH4zhSBP4sqTjOrW1YbG9+TKjZOiXlXM57sYDYz2ZjJdB6R3XWdL3sGlj5Jmw+scR1d5ujV1zSqdRvWjgJa1xmeDVMot7f3XXc/ouiP5D+b3iR4nhyFeQ3kJzLl5MX7W7+HrvYYDd0miupZ4a0kPQqRtpupwRLhC5PzgqAgOEcMwoieIYQmWLRz3n9Ut4R6COeLwzmvYPIG9hh+VeQSEHyPRzSMsqpmxEX+zR3G4gwYYXZDSkY5uXI2wqXRRDTV5wtqoCNhZWNuXNYWp5tmeR9f5B1gVOaZP9UTIIfuJJklml+qGKOGP5vd8Io2Rt9mMbjH4lmGj9D7fAGu1UkmpcK90f6cZwLFC3c9w7ArHN003qDUusQxsiHFkdRFV5oeRwpH/cv1QHqEdGzMFyOk4z48VjTTpwz9b053Q9y/Dn/OiBBs7jppOxagZ+APODM4oDn9NKXaguJkxHWFvpI9QHZ/UC83fIWU7PY/Krue619j8Py9bJ6JsNVpbvrMHsGfRotAZVaaH8Dgwi2/h0UHsQCDL/AL4QuYsP0WSafaNs0YHsdHAwgg9bmNLhRrL3An6AnvXBVVJrdXOD1zPcDQqzXiqHmq75/QkVZ6PzjofTriPXubaHufQr+X5fVR6Pq95tlxJ9YpZz/rrKEGwNf8Aq88x3xgz8RQiyM+0Q0z2bIeW+iX6ofWRP3Sp8Sd70unY2VxNn2Gy1TjOA2RCBl4eRU9NvtX2LLZsWAo0Th6WfGTMljS5jfVW/4HvJrNDpQBLqNPCKAAL2DArgYvtVfTuvNsE8uWRyP+Ya4+O/0r9lqrRSeOXfpW/N3achl9M7N47cyqiJBMzx1VvunQ9iHEmGxOTOyuA1Og10mUaSSIWKGLcWxFSsMkwVENEHOfntzv8ASV81Bkgm6z5m7ztEToXuKr+d8joNEkhIkHgxHFBcbLuXRmkwil4Jy8iSjEeeO+BrRq2WOR0tVN6p2WE0dWHHw1jiO15aCMX/AMYUyPaNdIARCWjGXECrAznwDk8c5UJFF0GaH9LP6dlZXRjXG++U2yn/AND57I3onPa/5yfRDHLGKHUclCgGCzNHLPBCRk4yH73RS2BLGRZZlRxf9P16YPFN5qehAcUuuhXmvGiWdAF1be9j3LV66zCkdJCaRqDyK/Wti/nnHuBt1XsFS18cREdfGVFHO2um9bbW1jzG2d7wPdAaAHHFWbxn70CeQpLNh1jnDr9mwYs9VkNxfDeR1Vzzfewvmfp6uGdB4Z6ZfLhukV1nR3HUdu3bsNNr1xKRg+m0/cCgA9SdIDOKPiqi2Sloxd0CBimNw8HZxjyZhjzi6yv3dIi1XrNS7V6qfUloaZpHSdIogAk0Bfgefusw08IhiiibbvZsa3qPLiABZvHPArF0iIiir1REREREREREREREREREREREREREREREREREWOXk55beOvhvzorqPkh1TWOZatH9sVXHbFOI2TbLGHMDX0ukajXsL2XcblmCIZyK7XauxnrwMzW1ngKoEMPH7xRSTPbFCx8kjjTWtBcSTxwDn9fp56uc1jS57g0AWS41QPfPA+SyNWDHmR6kPh54I0Ulh5DdepqTZZgsm0nLtdy3aOrbKxzXZHzVaTWSusBAi3szDDsGxPotWjm/syr0bKiP+oh+pj7L2Rl5zHwcprPgnNTYMgm9d2KGB3drzDSH4ll1dtfa2Ot80rDRc/S6WBuxbj/KI+t2TVicSBKLxseybFt97a7Rtt/dbRs16bNZXexbFanXd7c2JLvsIPtbeznJsLA2d/8AXOUWRNPK7+p8js/zWd7T6JnnDZtxc7TsJaRE34yPdPvH+yxYoAnmwDlY/rN9jjJZpWiR/Be7DBRGAO/LhzWPopRvmF+qS8hulh3eoeIXLaXx7oC/uCF6VuRYPROrTB/aVhtjV1EtfBoOmGliPFjlBJC6DLXzQkT19/maceQKM907r/V+2bKVuPYOlb11DaTJiiJ7/fdqutrtPsMl+8nERd0aZKNDJJhmcDDZiHjayNkUTIo2NbblFsDR7Vt+2tA0+njjIyZHAOcTjJe4k0cHms4WN6jW6nVEe1kc7IprfdHb+0VfA5s/VEW03xE9Gb1BvMowEjROH3XN9EPCHsoetd3CvuYc6JrjYcygH0ZdhRHbLugZmMe0ZWg6vtUEOXNeZINFnEmJQPiX+lr8XtArqPYPLvou5993WP3nudH0m1M5rx3GJoMNdVyF1kUHVL78Gf5SDXwO4aJgzGG4I1sduMx5ia/1HtW3AiTUCSVuDFDT3g/OiGt+jiOF7afa9ZqaLIyxpr3n+6CLGciyM3jOD4UEvXdb2Lb72q1fUqC62jZr02GtpNd12qOu725sSXfWOBVVFZATYWBs7/6IRRB5p5Xf0sjdn+S3C+P/AKAPqgd9HpLbPCIeJ6xdzOiZsPkBsgPOSKuONhTpCbvnzY7rr9XC2UeIdrZ+dfkTyGizCjzhNMKF6JPA/FPxr8W6J2u+PHDeZcfr5gggLIjSNSqai+2CGuZmMOTa9ojHdsu3GQ4/niy2i3t7F7nZfKS9+XOzkAsM1vrudxczRadkTcgSTHqefFNHSGm7sHq/RXkHp6JtHUSueaFtjwA7GLIJI5zjnxlRBfH79J7zmtkr7Pyi8ots21zIGTHahxHWqzTAmnZgrJvxsbxuse3nWFZAc24EndFpVAfaASV5g5FAWycZbk+J+hx6XnDg6xlV4q6Z0O5BCiFM2PtZVv1wy8njlAmksrOg3M6x0QY0iWuHzKyh1Ckro4pTxRQBg7SzHL2zq1nUus63y2pwXZu/PuC435p9fHmxEXYvY5rHSSS/XM0EGJzv7c2aJ+MYa5g8JROGjuxrUb5vGud0v1k3vGgyNxjabABFMDQQO9325CtY9v0OnFiGOm56nDqv4c54sgcLzIm5P4+aVAFUUOr891IB2YqjVNMoKjXwpSHYjjyNS67TDgB5l+OIvtzDBFDBCxshMsUEeXt159H6Zt/adkFEgDM/ByS2HXdSrnTGYbM7DmNnkjiY3J1pKxz/ALSswt+mJz4YGxQYfh3zbe43/uu6wtzFLb25rpIqyqF9oa6oAa/MroofsdiEQIducOJNKkzJLnDZCp5ZXN99gPHuG0fLhfzyHxXW3FRZYZdZieyEKKVrMyV9RDI52YR25xlspj2sMP8A6nytGhcwKDy6hpW9czzLO/IBJcG2RZzkV3NXYwuQDK4BjRHE3BIABPHcVzwB9z4VRcZ1O/0rnlJr+yF/k2gv5Uj4cS4nZWwkEPlhrIiGyysnjFa73w+PLYmOkdDC3MMTHuukiKre7rcXGsm8cfKlNADQGjgAAfQYRERdVyiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiKhemdN57xnQto6j1bctf5/wA80usfcbTt+0WMFVSUwDJYh2SFFkOa105Rc4wFcFDiU2zsiw6yuHKPLGGlgO+rX+oA6L5hQXXBfFR+z8d8bJ/sr9p2Wd+KjqPY2jWMr8NNMrypZtK5+bDAC9mq15Md7eQ5Lh26ydWWM+phXWz7JrN3l6IWFsTSPazEe40YNC6JPgA5x9VB1uvh0LOqQ9TyB0sBHU7Bya4A5P3x53keqL+og414qx2/H/EV2p+QfkDHMVV3e0uNnseNcnKEIkHOjtT6ecaXom2wSwSBx61rdwBTVM8rzL7aMGVMmo3EGXyP8ne7eWvTbrr3kF0fYej7vczSuaXbk/Crownuw6Kj1SgFbBS6tr4mMNaLS0IIAEbsOndC8mWeeWwqLbW1bDoNpjAjYHzV788gHWTiyDgNbdUBxyc0sL1m46jWut56WXTY2uxWCMDk9x5v6ovYYYgwgcMMecosqaIYUUaKScgkid7YYBx4Imvlmnmlc2OKKJrpJJHNYxuXZxjO2z08vRe8vPUL+nbdVqAuR8MhNhHO7T0sKzEp7Rmc/IqPnevQQMtuhGix4dh01fLXatAU38Cy2utMy2HM7XwV9IXwr8CK6mtObc4C3TsIYUEdp3TpA42yb+TY/Q2M0rWclRvqeehEvdM1gGmhVczwnRDW9jczROMmi7t6p0G2dTGuGpnFj2bCCGkV8bsgcjgWKPle+i2jUaqnEeyix7zgeojHAPOHXk/uobHgt+nZ80/Kz9n3LsQP+qlx476C/wB46RTkkdRvK6TGH/PWeUfkVtsF90ft8Dd7P06HMM0Z9bBdw4+l8xvw09GzwK8KK6rK0bjlL0fpYH1zzdk7NX1O/dAxYsglgkM16SxrGUGh/KKckb46NSUE84UzoLMuzdl88m01FrbdPU257kXNMjoYe0MR6QQP9xHvHAFgkjFgdllOk2rS6QAhjXvwC94Ds44sYyMVmsIiIsfJc42SSfJz/P2VkiIsYe3eQoWh/frWqOGs9vy2SIyd2PtB1z5w5+Ek+PbMRdphz2yQgZy+GD4OefjGMRikdo43yvDGCyas9gPJPau//ddXvaxpc40B578YHk5VS9n7lU8vEzXAsgt9xLg+wGre5zhK+N+cYYddZhlimZA5uXOHDhfESblntiQaF2SmYB0lHvvdN1n9iJbS2NdkmztjnPbXVAPzd8XS5ja9gYUOc5hBrxYse+faAWD2w7Lfoc45ttnatmLInNL/ABMT/k7JtVhiUx0b5f6sRMdLI15tlOzDcQjfa3EcePtlfFAxvy2caXpGt6BSxUWsV7Qg2O+0iV73TGWBeWMZKbYFP/tCCZcNxjPt8IIWYaOJCMNHFBHYOdHomFjKkmIHU4jDcDnkAfL9lFAdqHW62xDgcdXB+/zPbgeV8LmvKtX5hV5DpYPyLImOLFrelMZmwsZWRx4e3DsfLIgGJWZkHr4nughy7LnvnnzIRJcpEVc5znuLnEuc48lSwA0UBQHYIiIuq5RERERERERERERERERERERERERERERERERERERWM8kPJDjviZx3b+69128LTOe6YFkg00jOJrG2sZsPbV61rVW17Sb3Z70luA6enDw6cqdzpJHQBwFFQVN2fsXOvH3lO/8Aa+t7KFqHOOZ6zZ7Ztt+c7OWiVlZDl/44QrPkTaXVoTkepoKKviItb+9OrqSoEMtLAQWbmVeqZ6oPWfUn7UVsNvPZ6pwjSrOzF4lyN0zYh6CmllfBHtO2QCFFA2vRthBZDLfWLCTBKhj/ANgoiP2oZ052Ren9im3jUWSWaWJwM0vc5yxl8uIJz/aDeeDW7jr49FFgh0zh7jMGuBbwcgdxfJxaqf1R/Vz7t6km+lAFz2fNfGzX7MUrnnDAbX8oLBVbGcOPu2/HDxDRbPvRsVib8HZixTauBPHT0Qz52Wt9f6kkWXXhh4PeQ3nv14XjfjzqkNzcshhstq2u9KnqNC55rshUYkmzbvsMIZ8tdWRSvziAKtr7fY7mSOUTXqK4OjyJncEUWi2nSdLQzT6eFoLnGhwBRcaBLiM2bJP6rCXvn1k1uLpZZDQABPUcfCLwAPAuhnHOP/M+ZdC7Nvur8u5Tp2wdA6HulnHT6tqGrVpFrd3J745SHxiiDtc7EIgkBJ9kbNmIGsrRDLOxIFAEJJim5+lz+m459yRlP2j1Aa/X+sdPimEsNc4AMXBeci0t45EZkRPRJY48CdU2DLoIYJtbdJNzEQWS0CtQegNOBNpdunpmelRwT03OZD1esh1nQu5XsH3dG7vb0AYmy3REzMYfr+qRyyWBWn6KC3GIhdfCspZLKZrrS+KPOfF+LtHWt9+9XTasyabb3GHT2WulGJJBZBo8tB8DJHPJCyjbtlZCGz6kdc2CGGixl0ci7JFZ4Hy8+Iww4Y44YY8IogsMQwoo0UcA4w8DGxQDjwRNZFDDDE1scUUbWRxsa1jGtbjGMeyIsGcXOPU5xcTyXZJP1/n2WQccIiIuEREWD3ffIZ8TzNI5+f8AF7ftFv8AZQ34zluc4dFNWU87ff4vb75aXZwuw+N+PpCka9r58esMT5nhrBfcnsBfJsHzweV0e9sbS532HcnwAqg7j5HD0DTtQ0ElhN+2ScK3vmYw8Wm9o8NlHrH4d9ZNqyVzmSEf1j10kT4/jMXnP4eOnG+K3fVbX93tXFhajCVI+1uZHe5dqQ1+JJwK103zdOXO52fyj5GyQB4zI+TMxX1izfS4nwOz6EUPebDEXVaVF/atnbj6C797JHx/i1jntdmMVkkT2mWOWZa3DfxhPsne+YPZXWVlfS14dVUhwAVwEEYwYY0eI4B4I8ezWMbj/NznOzl8j8ue9znuc7M18selaYoaMle/JVm67Hzn6D6qOxjpz7STDL91t0P/ABjJ5PyC/HrmuU2p0wNBr4MVfV18WIhx4sZznOXZ+Uk00jveWcmeTLpSCJXOlmle+SRznOzlfbRFXElxJJJJySTZJ8lSwABQFAUAOwGcfz5oiIuEREREREREREREREREREREREREREREREREREREReJJI4Y5BhhEIogsMpJRRMscA4w8DHSzkETyuZFDDDE10kssjmRxsa573NbjOceyir/qTfU1n4nzVnghxy+Nr+p9o1mK17bdARVxIVJwbZhNo14zn0hL3zEgbN0gkVjrKJkMRIXP4SmTYxBu1WVHYbZt825ayLSxNP8AqPBcTgNYD7zsXQAuhQzflR9VqWaSB88mQ0HpbeXOOAKu+a+nPFrR/wCuh6s+xeb/AGm+4Xxjd/yPDnl10FBrX7C06uF7Ht9fXi/vG+7L9+Y5bamqb+S1q+fBvY2rzThjbY0bFndYyDH/AEV4OA8J6b5Odl57wXjevT7T0npuwQ69rVTFl7IcSfQQfaW9oU2KXFdr+uUoVlsWy28sbhqbX6qztSvYYOV2N46TSaXaNE2JnSyGBlyPNNsge895oHJsm67gUtfzTTaufqcS58hIa0WTkgAD/H38K9vgt4Ldy9QHuVNxTidN7/ygs9932zgI/hDmWofkNhM2jaDIW/3f749LSjv/AHTYrT6q6ujz/tJIvTN8FfBXhvp+8Np+KcUp/wCf9hZ77vtnAPnb+m7f+O2EzZ9nMhb/AHf749LSjv8A2vXav666uj/8wQTQ3pqenxzL05/G7XOO6ePWXXQbWAS+7X1KEFkFt0rfZGkSzzvIfFGXFqWrtNIoNCopMRx1NFFkwuIjZrrZbm42DrVPqT1DLus7tPA4s0UbiGtFj2pb/c/uQc0CMCrpZjte2M0kbZHjqne3qJNUywPdbfccEjwfFoiIsUVuiIiIiIsDfILyC/O/O0PQzv8AYP7QTYtiEk/8/wD3snqamdmf/If70Zx8bv8Ab/6hhnfg/bKd7wwvnf0twBlzjw0dyT3J/lALpJI2Ntn7DuT4Hy8nt/n1755EOIcfo+gGt/E+Mod9swsmfkS73+E9dSTxuxhozcYfCXZM+WSsudEC5g7Pyi6Q4LwCTc3wbduQ0sGpxu+ddXPzIPPsUjM5x9jnMyyaGojdjOHTMcyQ1+MxwPbDiSXP9cC4FLuMo24bgM+HVIX4lra2XDo5djljd/KSTH8nspmPx7Pfj2ce7GYos4gxLLnYtFFFBFHBBHHDDDGyKGGJjY4ooo24ZHHHGzDWMjYxuGsY3DWta3DW4xjGMKVNNHp2+xgrqz7R7a6iR9j+1jsF4MjdIfay8ctbdVxmvFfc8lfyOPAJBCKLDEMMNFGOOOPGyGCCCFjY4YYYY2tjiiija1kcbGtYxjWta3DW4wvZEVcpSIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIix/8qvIzRvEfx16/5IdHk/8A8nyTTLHZyQGExhlbFcfKKt1TTqwqZko8N1u+2H0moUcpLPxW3F2Fkp0Y/wBkjeTJ2jr289+630jtvTLT9537qm57DvW1nsbJEK642OyIsiRawWSaf9upq77211HUxS5FqKcUGrDwwQSGNspn9Up5rlbD1Hnfg3pOzfOg57S1fTe01tWVcC++87PDKVpGpbJHBfR1Ft+06dJVbxABYazLJWfxVQ2VbeySlngARGVt30btf5TRHWyNqbVU5tiiyKh01eR1nJrBHT4F4Zvmt9vOIGH/AE4DkD4XOIbfH+0Yo5vvyUXQa/Tyel8H4t8ND8sOy6qF/rDd4pRLTTxrmpljvuRcisRsy1dPE2wjbPU7Pv0EsewbQ6GGAsekk1/XSMwTjXY5MZf0IfT1p/PTzDZP0/W/4h8duB0sXQOuAE5Kiq9ouLJxtbzPnBZQczJYv4nvxLDZLAWTH4tvqGh7fTvnGJOEkz0tlW+tN6LANs07yC4B2pc00QMFrBRzYyRi8c5UrYtAHXq5WgjIiBzxTi/wK7Zs+EREWtFlKIiIiIiw88j+45oYJ9C049zL4hvw2G2Ekb71AcjJGvqxZWOy+G3J92OInb7PrhM/CLP5pLZQfSKJ0rwxnJySeAMX+n7rq94Y0uPA+lk9gD/x91TnkJ5ANkbYaBo5jXxvbMFsuwDyYc17XYdETT1crffDmuxl0VgazOcOxl4o7vb7Zc0XwLgUu4yjbhuAz4dUhfiWtrZcOjl2OWN38pJMfyeymY/Hs9+PZx7sZiiziDEsufj+PnFn9AtcbJsI0jdMqJ/5Md7N/iCzgfE/Fa1rsfLNbE12X2ZDcY+f9AEDvtlInC2XRRRQRRwQRxwwwxsihhiY2OKKKNuGRxxxsw1jI2MbhrGNw1rWtw1uMYxjCmzSt00f5eE24/G/vfcfWv0F0FHjY6Z3tZLr+xlWDkZz2/8A0c+LRRRQRRwQRxwwwxsihhiY2OKKKNuGRxxxsw1jI2MbhrGNw1rWtw1uMYxjC9ERVylIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIqF6h0TWuQc06J1nc55xdP5fou29E2skZkMhI+taTQWGy3s48ZE40Ek8NXWlSRMnJHhdJhrZJ4mZdI2ulH+/Uj+TH+gz07L3m9UV9G2eTe50XKQ2/s+LL6tPrX53TfTclkyR1tX91bQga1giWOxtM/wAUfOmroCIJti16dtuldrddpdM2/wDVmja6v7R1Alx+QGT8l4aqYQaeWVxADWGgT37Dk8k0PmCeMrn/AHkV27aPJPu/Xe97pj4bL1zoGz73ZCtnYRFV5v7Qg0OjGnjFCbMFRASC0wUmBBvkGDBnMDM+7MWZRbDPSo8Vf9cnz38duJ2AwROnTbnBvXTI7QP86sJ5tzaGTdtvpDRvjIzP8Y19N/BAEk0JAkNtstfKdBICwnC3tI+Pb9E99BsWlgJAHZrG4AHftQAWvY2v1M7W8uleASc/Eckn5Xz91Po9EjwnrvCjwK5fS2AwT+qdpCB7n1y0GfAS/F9vFRXla1qkRsTiMOC0TSmUGuzQBnm0s+0Q7XsVNJiDY5XSbdERaF1mpfrNTPqXkudK9ziScCzQFntQ4oUO1BbDgibBDHE0ACNrW4/6WjNcm82ebF8BERFFXsiIradW6RX8w1Qi+JjjMsJpMBUtW6bETj7CTGc4+ftn7MCCx4cQZIxuctja2JrmzTw+/ZrXPcGtBLicDk2fP/JXBIaCSaAySVbvyB7MPz+kn1+hNY7dbeDEcH1Ow59ABN74ltSMY98MLfF8o6uF7mu+57T3NfAN9JOHvEuSGdY2Igu2lMh1qslwTd2XtK6ayMle2X9qHMfjOMmk4fmcyfL3yDDu+52PtIHy+ndR1fa+3b/K2aeYgq2OdZ7LeyR5fBWAyS+5BGWY+MTPhFj8WprmOhhc9owUOYBY3SQbU9X1ek02kC17Xgowa0GP4xxt/qlmld7ZmKKmzjDyCyH4+c87/wCp7vbGMNjaxjbCRzdHH7NtGZ7fffkUP5x/4UVodO/rdYjafdb5I8/Pz+nC+jWVlfS14dVUhwAVwEEYwYY0eI4B4I8ezWMbj/NznOzl8j8ue9znuc7P70RVqloiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIoJf6rbuudo8mfHXx6AM+6v5FyW66FcwwSe0MO0de2FtfgE6PGcZkOA1nm9FZDZlY9owey5/Gka8w1inaLmI+vD09/U/VV8rD4yppqvTdg0/mFQNKUOWytZzvn2q61eijSDZcyOAncAtltniyOcSIRZzjE/XPFJEzMPROnE27mUi/YQukaeQHEhv7hxojv37Kk36Qs0XSKHtHtaR8gepxP7V4vN3Y1CqYD+k74CHZ795TeT1nEFIVqWsalxPUnPbLMZHLulhLum7FR4/NYMD9A2oaYJCRJWlmGRWdgOHYVg0FoLcw/l0c/01vJZea+l5pezkRZhn7n1rrHWXwvmMdOyIS3C5CHJOOWIKwL8sDk4p4kQUhoZVcUFaML++wnEFzX1jqjptnkYDR1EjIhWDV9ZHzBDaOO93aodkiEuuaaBEbS+ucggD7jP3FLfqiItNLOURERF825t6+gqrC6tSYxK2sEmNMIkdhrY4IGZe/2984+UjvbDIosZ+csrmRsxl724zqi3/cti7VvzJwwy5XHTwVOr6/HI2XIY2ctZFDh39nFicqX5m2BMjsRsfJJh8zAhocRXk8pOrNv7XHPaMiOSnoi2zX08bZWSEbEI8saSty92cNkEq2Px9zcNy2Syc/5f1AQPzdDxe5PLr1a/oF+LLBdXYzx6MWf684FoCWiENsMxfF0kJlnIxzY8uy18Vc1vt/SfMxtjA0aaEzvFvdYjBGRx2ofMk9uFEkcZn+ybbWNNvJ7gV/ATyb4V6+S8xreW6w2mGlYbZmytOvLXMTWONO+pkbYocfH7WV4bWuYFBK93wzIQRnDZi5/e6CIoDnOe4ucSXONn5n+cKUAGgNAoAYH/P35REVr+w9q5T4/6LZdL7PvdBzzSKucQOe8vyXRMJsrCX6KylqAB4yLS+2C2n/2eo16jCsbu2J/2euAKm/oXDWucQ1o6iTgAG/pWfucUvOaeHTRSajUSxwwxNc+WWVwYxjGgkuc5xAAb3JIHfgq6CLT/T+uB4OnbIynvpO1aHrk1gPXwdJ3Tj+wg6Nn8p5A4x9g6qludt12qefFADLY7RqdGMC48OysXh0f5VsNt0rrGvuK8C2qTw7SqtAxbGss60qA6vsa82BhIR4Bgz5RjAyxpY5xCh5ZICIJGSxPfG9rs8ujLQHOGCQAQQW2KNEg0HcYOSqraPUWx7+2V2zbrodyEDzHP+U1EU3s3isPDHOLfqSPC/YiIuqukREREREREREREREREREREREREREREREREREREREREXIw8091sekeYflVv9rH9B+5eRva9kIEwTOXEB+79H2Q2KsGnKy6Z4VXDNFXgtf8frDGgiaxjGNZjrbbHb/w/r19ffj4L/ZKW1t/xMzfj/lftoM5v4/3/XN9P3fR9f2/TN9fy+f1SfH4Z42xJJBhBBhhE5RZU0pJRRMsk5BJE73TTkETyufLNPNK50kssrnSSSOc97suznOdiegYrk10pGWsYwc/3G3D7UORm1jHqNx6dOzs7rsfTp/n/leK6s/pT6F/o29Nzwl1hwv4c0njnzPazBHQfjyjWPQKAbfrKEmDIQD4TY7DZiWHRyj5nYZidpBJs+JDSOUwuxPyXScc15XzPnP2BS40Dn+maV9taN+HXSfwrrlbRfYAJ7NwKE/8D5CjfFv0QZji9sfH2xL9ey1p9FDfxSSPrz0hg/bqH6ry9OsBknf3awN/+xB/4P8ALVwURFrBZYitN2fo8XNNLLtoZI/3s+T9s16F8LSWvsZYpJfyJh8zwZ/EEhiklmly50bJcjxPjlzOyGW7K1b+R/Qcbx0AkEKf7aHUvvpa3LHfKGc1srf3qxZ7Ze3P5BkTBIpYnuiICrQiGe2ZHe8nSw+2lAOGM95x81/b25+9CzWLXlNJ7NhI+I4b9e5+w8d67L8XCebzdN3jEtniUiio5RrnYp5m/kNPe8rMo1UVJJK2TLrqSErE8uPslyNCY/HtJ8ZMbU2MYxrWMa1jGNaxjGNw1rGNxjDWNbjGMNa3GMYw3HtjGPbGMeytFw/QY+f6BVAzCOGu7WKG4v8AEv1uIjsC4I8/hSyNghf8a+HDBsQPzNiCfBGGTzNfmV9301U3tZSB8DPdYAbFcfrhcQs6GC/idTnd8kcX3pERfNurmn1yntth2G2raGgoa065vLy5OFq6emp6sWU6ztrazOlgCrq2uCgmMOOMmhFEFhlIIljije/EdrXOdTR1E4AHJOcfz5r0c5rGlziGtaLc44AA7k9gqa6V0nReO6Bt/UunbNWabz/QqCw2fbdnt3yMAp6WrgcQWTIweOcsqZzW4hDrgByrKyNlHr60Qs8kcaWEP5J+ZG9eob2kruOwQmUPB9NsLil8V+aEzmQSVuuRH21VYdb3apyTNWv6Xv4WB8YdB94+q662LXqkuxhyRsF1SHqXeont3qjeREnBeSXNnR+FvJL95k8cBZQDezk6/cuDl6PcsjHGLjBuWyNH5lrFph09RWOftlqGHfFm1NDSQAIlYCFWgQtGBrxBwQh2Zc5o4gkLBx4WZe5z3NihjYxuXuc7OG4y52c598+u6EbXpmacOrW6lgdKBzp4TTgw9w9+Oo5IF4NkL8J/1R/jI6HSn0RsGrdHJqSTuk0Ly135cEEQ9TXCvan4hYtgzhy/WpKXoYbtst341dZ5/alWFhrHHe+3Gp8+lMdM+Ci1nY+d856QTpNdJLFiP9u1zYdzujqoSCd0NPR7BUUIogdfVAtmj2cv5duXZ93pucaEyrbsd/8Am5gstgK/btZ18CuAJs7bZdqss5x+BrlBWiE2drNFiU8iEfFdTiWF2bW1peyncfMTSvE7jMPib4Q39taBjWG0G9L75dzEFWe1bnsU+W7Rdc+bkyUKpgPObLmssqyCKkp62ACLUoZ8sh2KSo0L/YwTyzSEMfTI2E5c8OaS4A89IxeALFlag/p79Txfh2d69d7/ALi+DZhpZNDpdu9oXajd9wuKQNggcfe9iK65TQZ7QW7NLcP5cepBxzxcKn1MUd/T+pQPjwVotDaQ10FCyaCIuGTa9heJYj0riRZoZRgRwLS1kZMPPJXwgzsMxZDxi9XHQO175Rc36Noj+U3mzmvq6G8j2Nmw6wfbkSiR0lSVPLU05tUbbzTkBjuniJC/KgCj/Mw+0bAJGHLLLsCyTjySDTjSJizDC5pCSyyyZHTEEkkTOfNOQRLI+WaaV75ZZHuke5znZzmrubaltW+9B0rTNHG/L27Z9npafXI8sy+FlqYfBGKUW7MBDIQAXuwbYlTQSDhgDklkt/HhkzjwGuldM0igwuADALJBIok89R4wcZFZVwz+qj8RN49b6GTbGQQ7NqNw0+mi2GPTxyumglmjYA+YsMxnc0jLHNaHH3WgYM8pF/ETctija7+9sbG5/wCeG4xn+f8AzX9q4X0v08jpYIZXjpdJFG9zeKc5oJH6lEREXsiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIqS34cgzRN1DDHmKLJ1LYxxRRopJyCSJ6YyKAceCJr5ZpppXNjiija6SSRzWMbl2cYzxxF2aFyMfNLmeONeX/lFylkX0jc+8gOu6pXM/M/P96en3y9EpZvzctZIT+RUxhEfZPFAVn7fYscYnEsEexfQMoD9dEeXNY9v0aQHf5FfdYx6iaS2B3IBf1fU9Nf4B/fssZV2O9BuX7Houk7DKbBZyX2pa5cyWQ2R3DWD7SnCOeaO4RrRHQFun++LIzWj5jkbmFuIvjhccRdUj0h+5VfkH6b3iNvFcQQQXS8f1jluyOIrc1cn8WcgDj5psMjR2vkHkgLstXlPFKCe0QkYuKaMWvc59YHL9ewudptHOGktje9hNfCX9JFnwek/yl5+nXgSTx/3Oa1wH/Sa+vdbIERFq9ZWqC6ftv8AA2hbNs0ckcZYFbIyszIz7WZtzXMBq8OhzjP3MacRBJNHjHxzAyVz3Mja+Ruuvx40xu7dNrH2MEpdZQNk2Syy5uHxTThyx/t0JUkrvi9hFpKPJNBls8hY8JMLovpzPPBkt5g3bw9O1qijlazNzfTGys+WcSTDUwbmuZ8fbLcxNJsxJZM5zhzZI4Pj74y5ePh/rzBdV2TZ5R42k29yyrHIc3OZ3A1Q0czsRuzlzWQSGHzNfiPDHSyi+8/ybCP8LGIiHSSSDD5HUPmPdaP+bPnA7KK/39Q1h4jHUfrg/wDa/wDCzBREVcpXHKKDd64fq/3PkPtuzeGvi9sxUXCtbtiNZ6ruuvS5zP23bqqzmDN1zXrKvKlzY8oqjR4oByBPrF6BaxTWELrHUoaMu4yt9dT1iCasjePBbxa2KFpuILXT/JDqNRM9xFZO55VVsfF9VK+DI4bGKNs1d0a8ElmkAfMVpYkotsLsTQ44/idyHFzb/wCki6ga6ooSHjUELnzRSk7DBkSf9x+LfiyUKthkexmXOcyawkxj+eQSI3ZPotLDtOifvGva0ua0nTQPFkvPwONmsnIFGueAtCfi9+KGj9K7Lr3xTgCCMxlzCAZ9Q7EcDDi7dQeRkC1ldwXk0HJtKhri2wv2a3c0/Zy4JpJoHlNdN+GEP884ZiGtElwNl8bcNIJyUVjOWTMay9yItc6zVS63UzamZ5dJLJ1OP14b8mtFChgDgkZXyf33eNbv26a3dtdKZtRrJnzPc4k0XG2MaCTTWDAF4qhQCqSp2/Y6Km2XX6azkravcB68PZYxoRWF21fWFOOGqp7P6M2cdPKdmE4+nHMhrLU0CpKsxDCKeplCptEUayaBJIFgA9hfA8C7P3tQZNTPLFFDJNI+KAObDE5ziyJrj1ODGk00FxJNAWTebKLcn6OnjuNv3Xb/ALnfwjz0vIIIgNZElzHI4ve9jDJhZYvg+x/vBrtD+ZJG0sdrc2tzUn1pGSqYj6tNimk+EHAQPHLxx0HR2Dtj2SzBZuG+FuglGIN3PZBhirNhMc8ApHxpRmA6yC8oQQvNVR1+DB4y8TYU3Qxe0l6yLawX2+I1QHf538ueF+lf6WfQbfVfr6PeNVC2TbfTLW66TqaC1+tJA0jKojqY8OlBo5jp1Wst0RFdr6qAUKHAwEREREREREREREREREREREREREREREREREREREXO+/Uz+O8HIfUIi6tUAmj0fknzHXd6MLnmsSgpt51F0mg7QKDOUDCGNiKmo9NsiqkSxs5A5bnB0za8W0rgmdEFaZfXT8Ff9dvwa3HOqU37l2rgf5/YeT/jQfbaW/7NXyfx3ognwa4if+M9UhJ/bq2H2wfuFLqP2Z+A+VkPpjcW6DdYnvcRFMPYyEGgA8jpcbFdIIBJ4oHxRrN20x1Oke1uXsp7B3JBF18+kHHcYXMxUxT9K/5qU1Fbdc8Et0vIQS90sye2cQGPKEhbbbDX0IlZ1TU6v7mtMKs5dY16h3KvqBpp4WVetbzcsFGdFYzlQ61WfOeh7pyTftM6jzjYDdU37nuz0u46dste0d5lJsmu2A9pU2MMJkBIRX4xo0MkgZwpQBsWHinCkiTTQSbb3bb2brt82mJBL2h8TwOHDLTfazgkVgkYWGaLUu0epjmtwDTT2i8tJF9WPoa5GTldjVFq39LP1QuTepPxUbYKies1PvOlVlYN2zkeJnxEUNzJFHBJtWpwFlFG2nONhNbLJRWLiTC6mR+aC9I/dRmkHbSFovVaafRTv088bmSRuLSCKv8A+QOLaRRFEgg97WwoZo542yRPD2OF2PmAaOORZu+a7Yuy3YeL1vWxqnM1wTRWlM4loZ0YrbEZ4xjoHEwEgOJDzI7LhonDzRGQOidl/wBrZ25axlb6BpVZz3VazVqp8k0ILHPILlx8ZTz53fYYbIz5vxF982XZiga97R4cRwNe/EfzdWSLyMshY1hNsaTQoVfPi/GCazycLsGNDi+qcRRPkY/7Dwijk+tb6wMPi9UXnir43XcJPkVtFE4bet7qLCN+OF0V4NIyOACcEnBA3WLSvlafTxvcPNp9YXX7NJhxx1I3GTHq5+qzrHgXoMvOOdkB7D5T9C1wgnSqd0Y5tbzalPyXXD9L20cmIgMnI5Y5X8J6yTDM3YLMGSWyhbQhl/lc/wB2O92Hdtn2Lc9uubHZNs269t9o2jYrguQ+3v8AYr+wntbq5tTiHunLsrSzLJOOKme6QgmeWaR7nvzlZHsm0CUjV6ptRNNxsIrrcM9RH+36489lrH1x6zj26N+26GUfmSD+YlaRULMdTQ4WQ8i7xgfOq9NI0u76Tt4VEHO6WzuSSCTbQ+SYj6o2tkLsrI6bLpJZX/Fsr3Okf9hRUkcH2ZmIbnO4HW9eqtToqzXaSBw1XUjNFEifI+aTDfk6SSSWV+cukmmmfJNM/Pth0kj8ta1vs1tgvGnmsGqaozbDWNfebYPERBI3JDcC6/K2CcEXMU2GMzMTKzJ0pDGOZLFIIyGR0cX2S5MLHfVW7nXasaWJx/Lab3A1p910gIBwLBDcgdhWML5j/jH65l9S707a9NO523ba9zCAXFs+qB/1Huo56SC1pINGz3oF6QwykSxDwRSTzzyMhhghY6SWaWR2GRRRRMw58kkj3NYxjG5c92cNbjOc4xiuuZcv3vsW6Uugc41uw2jabwhkIleBC5zIIcyxRz2NiTnGBqypB+xkthaGyQAgxe8k8zG5xnMnzwh9NbRPHGCo6D0hldvPbcDvk/Oy38zV9JmnljfiLUxTBYHyWsETGwy7MXAyxzh5MNbFWiFFQk43BppJzgdLARbzx2uq5Ivj7HuvD8LPwZ9T/ibr2nRwP0WyQvb+d3jURubAyMOb1sgJAE03S4kMaaB+ItBtaX7DwbN4n417b5BeSkhepXtjBnWeS8mkyyK5ttp2MScWpt9kmgsBpQZKMb9w22LW45oy2wa6+e+iKHjJ1az1yrcF6xPdxegdw1/kFBYkFUvHqmXF/HERj9sfvGzxiHGRtihiw0silooqgVxcpZH4Rp9vVQi15I9o6w0+rnVNjZL7KJnSIwGuNklzsEk9hVhtCgCOLtQ/xc2303sfqp/pf0rAHaTYI49v1GtL/azbluDaOqnkcMNIlcYGsj6WARggdRJWwP0z+EC9y8pdSbeVpNhqHN4ZOjbCxsDX18xVGQM3WK2xIlkjhbCXsk9eVKDmM19tX1tkE8LILjzQJfuMYxjGMfyxjHtjH/DGFq49JfhWOV+Mwm821P8At23doPbuBZM72OOm04ZsomiQO+uCLEVfPWymbJWw5lMkwzZ5yJCYnE5Ar9o6tdJF7KFoPxO9832LhgfYduASV9Gf6bvQrfRn4daCaeIM3PfundNYXM6ZGMmYw6aFxLQ4dENOLSBUj3gYNoiIpS/QSIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIDRscjIRc8r9QH6Vtj4idzs/J3imofT4u9yup7azB16tniqOK9XtSJJ77UyxoPuCptM3E2R+x8/eO6vqa4o270Gup6iu1rXHXccxdjTovOtF65ou1cz6ZqtLu+g7vTGa9teqbCHGfT3dOfHmMkQsaTH9/+7KORC6IoMqKAwOeAqCGePnlerf6GPYvBm92rtXDai66p4fzmz2LboJ2bbdOJikuxMyk6XXRsxYF6yI90w1T0cAcun/HHgG3ObXbo6pxfbW9L+pYtRFHoNa8R6iNoZDI402VooNaSRhwGBZF4784hu21Oje7UadpdG425gyWGqsd65Izxd8LSnxnt/XvHfoVH1fh3Rtt5d0PXZ2TVm06dcFVB/04IHInq7KOF/4l3r9k4aGG71q7GsNfvgsPr7qsPAnmGkmQ+DP6pHn97Xa5o/nvoh2lbRIcRXG9v5FrZlpz9tdFBVsq7rceftt7nda00h2LmTYSNEE2aF5jKx1Jp4QNgUNRwi0WR7nsu37qwfmYrkA92VhDXgYoAgEOFZHVYs/rV6XX6rRPJieem8scPd5FgixV0GmsgYyuqRrHq/emNt9MHe1Xm1wUQE6EeeGDaNubpFzGwkUcyNput7oNQbDXzNhJjYSNYVYxAhTSASooTxCh4Nf/AJofqOvCvhdBaa542Xf+tF2Y6G0q9dj1gGzD5Jrl9HOVVg2W5bnZNpXbBSxWETTowee5uc7DWxtbBsNCLZg3jeduv6je+J7JI3Za+NzXsd/i17M4c12P/XGcYz/kqCL0Pt0UgkfLPK1tkRuLQ1xxVuaASLHaiT8lN1G/ayWCVkTY43ujc1rx1HpcQBYF9jfnOPIGfHS+h712jou6dZ6bsBW1b/0LY7Ta9t2Axg48lldXBTyypIgwoxa+tBhy/A1bUVYgdRT10ItXVBBVwYosVKwi4x7fy/n/ACx7f+3+Hyx/fn+Wff8A+VROtdB1+zEj/ci4ao+NjMERlObFBJJ7P93jT5c1uYnYj+eWOwx0WZGR/wBpn2e7fj6OXpkn+cPQKrs3RqebPiVoGxFQbCf+bJWP6xtNKPEVFz/W5Y2yHEa/BYEVmd8vwWCjftGLLWaG7E2eeQ2gh64nQRP9tGYo2WwAjpaaGGto5sA8HzzS/Pf/AKHvu77s7QfldS+XUTObLM5j/ZNa4jqldJRHSAbsXfFHhU1oXP8Ap4nCOV9Q2Tnu1a7pm30rw9a2OzpyhKi+i1+SGnmPAJf88ZAMkxBJXEz5hjsopvsAyRGx7mZd+Kvhj17yv2aMDUa2ag0kSZzdj6VcgkZ1qmYxj3OGD/rGdsF09zGxRU1ZPmSJ8sU1nPXBPcW2ZsNT1IdWLSCVdcNShAw1YVQOCNBVh1o0DBYK4YCKNgg4MArIxoRIYmwRDtbCyNsbcNx+yAeAWNkA8EI0ELGxRQDxMhiijjbhkcbImYaxjGNbhrWNbhrG+zW4xjGMZ1NPo4pdTJOC4Me8vEVA8ngusYP0+V91Ww/0fen3+pGbxrt91Wo2t8zdTqNoEDWOkmPS6SM6tshcIXSEmhH1hh6S8H31jZ4y+KHJfFjUGa5zyljfdnigx7bup7Gy7JtxoTZXNKsSsudkYSOYkqQGoDzDXVzSJcDw/bLPPNcPuHWdc4Xybe+sbU//AMH0ugJtHjNmZBNZ2DviJS0Yc0vvDGffXBIFNX5m+MX5xw+JXNZ8nYuqtCHrReQ4sFXpfjVQzQynHzi9D36RjY5Xg14jyg9RpsPdHM2KeyNxYXJzGPGsBBqmmdjMlfeSsl9pHt08DiAGhoHS0cWcAD71eLNX2W7/AF/vGx/hJ+Gu6anatLpdth0OhOk2vSxMbGx+smaIoAWgAyOMhD5Cbc5oe4nkrQbtWyWm57Tsu4XcmJ7nbL+42S3ma8mTEtpe2JNodI2QsgoqTDyi5nNeUSSS7DvlORNLl0jrveL/ABW28gu7845bWh/kC32wCE7LK/8AKaKBqFQ/FntJxM4ko80OG0wpQ4eGmAvLtCQK0c0Uo0eTFglIp9FzgR9LrG9+RV6M2Bu5++iaLiQYfE01BSWH37VbwmObIRkGw2IUSnjghlFbg7VLCQyAr/wyUal00Zmnbdmj1vPOGkE39eF8zfwg9Jan8SfxL23TatsuogdrX7ru8ldVaeKQTSCQk4Er+mION+88fFeN5oAIlYCJXADjiA14w4YYgsMcAwww0bYYIBx4mtihhiiYxkMUbGRxxsw1jcNxjGP1Iiv19ioIWQQxQxtDIoY2RRsFANaxoaBQwAAMVQ/wCIiL1REREREREREREREREREREREREREREREREREREREREReJIw5g5AZg8JQhUMoxQpMUc45I87HRTjkQStfFNDNE50csUjXxyMc5j2ubnOM+yICQbBojgjBH3/n3RR1/Pv8ATkeJvlVYbP03g1ob4udt2A2xvrR9EHLsvHdy2CwnmPNJv+elGik6obZk5YPiz55c0VLWYnNtzNG2ezlfiWMN3/8ATw+pvxa5tGavyCs7zp4tmSJWbfyXbtZNJsAslPhrDCtH2C2o93BmMGwwkyEWktQKp/2wEW8jGwkz9KFFk2g9V7roWNj9oJ4xRDZ/fIaOkEBwp2AKy7p+Q71Wp2fSagl3QY3E2XMwOwy3iyBfHN5XJKt/AfzqoPx/37wt8s6T8v7vxP3bxy7DW/k/R9X3/j/m6dD930/dD931fL6/ti+fx+bPe/XMPR09TjrRogWu+GHbdfaRMLE83p+s55ACIwk/9uySVL1CbUpGwjy4cQUyCGcmGvb+4YHcI+KV/U7RW7vXmuLabpIGv8nqIzVU2wfPJN484hN9OwA2+aQt8AAeMX+v84h4+C36W0HVNop+geefTNZ3wKnNgsB+GceK2HOr3n1tbNCPvXRbet1W/mCbK76rLXdToq78h8OPp3ScKSUeeXDoehaTy7Ttd57zjU9f0bRtRrIKbWNS1WqCo9foqsb3+kKsq6+GAQSHDnPle2KJuZp5JZ5XPmlkkdVqLFNx3fW7nIHauZzgPhYMMacUQ0UDk1eSLF3Vi30ui02kaWwxgOwDJRL3YANuOaPNDg5xlERFWqWvm3VuBQVFre2k+Bq2nrzLU+f65ZfoDBGkKJkxEOyWeXMcMT3Yihillkzj4Rse/LW5hDeS3cLryK7Xv3W7jM8MWyXEjdfqyHt+VFqlc1oGtU2WRyzDsmDqRh3WcgnwHNuZbGzwxsp0uXSNPVw76dyfx2h57QEMG2HuFgZqRBDSoIihdJAHiK3J4wznunKxZwk1usGfEZ4sNdsRckhQpv7c0iKsqrcJctiBx8T2+TQ6b+1+OfuvnZ/WF6+Ot3XbfQ2inJg21g1+6MbfS7VzADTMcPMcRc/H/ui8gkVdoOj7F0zd9V5/qQWT9l3K+rNdphs4kbDk21KjFjnLfDHNkWvDxI4uxNdG6IECAkyb4wQSOxOG4zzGo4xyvQuWUU5BdZo2sVWvwnF5zkqxlBGYwuyJbiSRkRFiZ950w8OWijST5HFjiGiiiZHe9HTx3G37rt/3O/hHnpeQQRAayJLmORxe97GGTCyxfB9j/eDXaH8ySNpY7W5tbmpPrSMlUxH1SbV7aCLpjMhGXnB4PQMeMWfmQtl/0h+ghs/pjWestbB0azfZDBonvADm7fp3AW3AIE04cSOCGRkYKIiKev2QiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiLq/q6XdPxdJ6f+qjX7qIF6mvYrzq/lp0EA6f40HMCsc41aujkm+kUel95bsuSOVkEb7Cz2EiymIJjHY78GGrAzObBWDFy6/Fvg9Qz01utbH1i/wC1cEopN8qt9Mlu9u1EQuor7vW776IcHH10NibX4vK27mjcW4cLJNwNZzktyKQJIyUanfB/0tutxdT1vpPkTrQ2majot2JfV2nGW1RbXW2XNTJgyocUPSF21eHroloOPPYj2ZURVrEPkL8B9cU8l1LNp5pNS4FpIc4Hqo10ANBN4GOKu8Uvlb6v/CD8SPVH4ubrptbs24Sxbnvj5Xbs+KR+gZtz5wWSfmaEQYzTkNEYcCC3oABwtxng/wABr/HLxx0LRmDNj2SzAj3Dey8jyjEG7lsgw5VmwiOeEQj40o7AdZBcSIKXmrpK/wDNHjK+/Cy2TGMYxjGP5Yxj2xj/AIYwiuWtDA1owGtDR8m1X+F9O/T2zaX07se2bJoo2R6bbdFBpYmNHSAIY2ss1klxbZJLiSSSScoiIuVcoiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIi4oXdC/NC/wBURERcoiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL//ZAABRDBQAAABTYW1zdW5nX0NhcHR1cmVfSW5mb1NjcmVlbnNob3QAAKENEQAAAENhcHR1cmVkX0FwcF9JbmZvY29tLmFudGhyb3BpYy5jbGF1ZGVTRUZIawAAAAIAAAAAAFEMUwAAACYAAAAAAKENLQAAAC0AAAAkAAAAU0VGVA==";


/* ── SUPABASE CLIENT ── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseHeaders = () => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
});

const supabaseAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${token}`,
});

let _currentSession = null;


/* ── NOTES CLIENT → TIMELINE FREELANCE (store partagé en mémoire) ── */
let _clientTimelineEvents = [];

const addClientTimelineEvent = (event) => {
  _clientTimelineEvents = [..._clientTimelineEvents, event];
};

const getClientTimelineEvents = () => [..._clientTimelineEvents];

/* ── SYSTÈME DE NOTATION CLIENTS (keyed par email normalisé) ── */
let _clientRatings = {};

const normalizeEmail = (email) => email.trim().toLowerCase();

const getClientRating = (email) => {
  if (!email) return null;
  const key = normalizeEmail(email);
  const data = _clientRatings[key];
  if (!data || data.ratings.length === 0) return null;
  const avg = data.ratings.reduce((sum, r) => sum + r.stars, 0) / data.ratings.length;
  const allBadges = data.ratings.flatMap(r => r.badges || []);
  const badgeCounts = {};
  allBadges.forEach(b => { badgeCounts[b] = (badgeCounts[b] || 0) + 1; });
  const topBadges = Object.entries(badgeCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(e => e[0]);
  return { avg: Math.round(avg * 10) / 10, count: data.ratings.length, topBadges, clientName: data.clientName, clientCompany: data.clientCompany };
};

const saveClientRating = (email, clientName, clientCompany, stars, badges) => {
  if (!email) return;
  const key = normalizeEmail(email);
  if (!_clientRatings[key]) {
    _clientRatings[key] = { clientName, clientCompany, ratings: [] };
  }
  _clientRatings[key].ratings.push({ stars, badges, date: new Date().toISOString() });
  _clientRatings[key].clientName = clientName;
  _clientRatings[key].clientCompany = clientCompany;
};



/* ─── Google Fonts ─── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

/* ─── Global styles ─── */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; max-width: 100vw; }
  body { background: #F7F5F0; }
  ::selection { background: #1B2E4B22; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); opacity: 0.5; cursor: pointer; }
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0%,100% { opacity:.6 } 50% { opacity:1 } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes cardFadeOut { 0% { opacity:1; transform:translateX(0) scaleY(1); max-height:300px; margin-bottom:12px; } 60% { opacity:0; transform:translateX(40px) scaleY(0.85); } 100% { opacity:0; transform:translateX(60px) scaleY(0); max-height:0; margin-bottom:0; padding:0; } }
  @keyframes magicShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes toastSlideIn { from { opacity:0; transform:translateX(-50%) translateY(-16px) scale(0.95); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(27,46,75,0.18); } 50% { box-shadow: 0 0 0 8px rgba(27,46,75,0); } }
  @keyframes ndaShimmer { 0% { background-position: -400% center; } 100% { background-position: 400% center; } }
  @keyframes bellRing { 0%,100% { transform:rotate(0deg); } 15% { transform:rotate(18deg); } 30% { transform:rotate(-14deg); } 45% { transform:rotate(10deg); } 60% { transform:rotate(-7deg); } 75% { transform:rotate(4deg); } }
  @keyframes alertSlideDown { from { opacity:0; transform:translateY(-10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes badgePop { 0% { transform:scale(0.4); opacity:0; } 70% { transform:scale(1.2); } 100% { transform:scale(1); opacity:1; } }
  @keyframes cameraPopIn { 0% { opacity:0; transform:scale(0.88) translateY(10px); } 65% { transform:scale(1.025) translateY(-2px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
  .bell-btn:hover .bell-icon { animation: bellRing 0.6s ease both; }
  .alert-row { transition: background 0.15s, transform 0.15s; }
  .alert-row:hover { background: #F7F5F0 !important; transform: translateX(3px); }
  .instant-action-btn { transition: transform .22s cubic-bezier(.22,.68,0,1.2), box-shadow .22s ease, border-color .18s ease !important; }
  .instant-action-btn:hover { transform: translateY(-4px) !important; }
  .whatsapp-btn:hover { background: #1ea34b !important; box-shadow: 0 8px 28px rgba(37,211,102,0.45) !important; }
  .card-deleting { animation: cardFadeOut 0.45s cubic-bezier(.4,0,.2,1) forwards; overflow:hidden; }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
  .fade-up-1 { animation-delay: .05s; }
  .fade-up-2 { animation-delay: .12s; }
  .fade-up-3 { animation-delay: .19s; }
  .fade-up-4 { animation-delay: .26s; }
  .fade-up-5 { animation-delay: .33s; }
  .btn-primary { transition: all .2s; }
  .btn-primary:hover:not(:disabled) { background: #152438 !important; transform: translateY(-1px); box-shadow: 0 8px 24px #1B2E4B30 !important; }
  .btn-secondary:hover { background: #F0EDE6 !important; border-color: #1B2E4B88 !important; }
  .plan-card { transition: transform .2s, box-shadow .2s; }
  .plan-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px #1B2E4B14 !important; }
  @media (max-width: 480px) {
    body { font-size: 14px; }
    input, textarea, select { font-size: 16px !important; }
  }
`;
document.head.appendChild(globalStyle);

/* ─── Tokens ─── */
const C = {
  navy:    "#1B2E4B",
  navyD:   "#0F1C2D",
  navyL:   "#2A4167",
  gold:    "#B8965A",
  goldL:   "#D4AF7A",
  cream:   "#F7F5F0",
  creamD:  "#EDE9DF",
  creamDD: "#E0DAD0",
  white:   "#FFFFFF",
  text:    "#1A1A1A",
  textM:   "#4A4A4A",
  textL:   "#8A8780",
  border:  "#D8D4CB",
  borderL: "#EDE9DF",
  error:   "#C0392B",
  success: "#2D6A4F",
};

const T = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

/* ─── Constants ─── */
const STEPS = ["Tes infos", "La mission", "Paiement", "Contrat"];
const FREE_LIMIT = 2;

/* ─── Supabase helpers ─── */

// Convertit une ligne DB → format attendu par le JSX
const rowToEntry = (row) => ({
  id:            row.id,
  date:          new Date(row.created_at).toLocaleDateString("fr-FR"),
  missionTitle:  row.mission_title,
  clientName:    row.client_name,
  clientCompany: row.client_company,
  price:         row.price,
  startDate:     row.start_date,
  endDate:       row.end_date,
  contract:      row.contract_text,
  signatureStatus:    row.signature_status,
  signatureRequestId: row.signature_request_id,
  form: {
    freelanceName:      row.freelance_name,
    freelanceActivity:  row.freelance_activity,
    freelanceSiret:     row.freelance_siret,
    freelanceAddress:   row.freelance_address,
    freelanceEmail:     row.freelance_email,
    clientName:         row.client_name,
    clientCompany:      row.client_company,
    clientAddress:      row.client_address,
    clientEmail:        row.client_email,
    missionTitle:       row.mission_title,
    missionDescription: row.mission_description,
    startDate:          row.start_date  || "",
    endDate:            row.end_date    || "",
    price:              String(row.price ?? ""),
    paymentTerms:       row.payment_terms,
    revisions:          row.revisions,
    latePaymentPenalty: row.late_payment_penalty,
  },
});

const getHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !Array.isArray(data)) return [];
  return data.map(row => ({
    id: row.id,
    date: new Date(row.created_at).toLocaleDateString("fr-FR"),
    missionTitle: row.title || row.titre || "",
    clientName: row.content?.clientName || row.contenu?.clientName || "",
    clientCompany: row.content?.clientCompany || row.contenu?.clientCompany || "",
    price: row.content?.price || row.contenu?.price || "",
    startDate: row.content?.startDate || row.contenu?.startDate || "",
    endDate: row.content?.endDate || row.contenu?.endDate || "",
    contract: row.content?.contract || row.contenu?.contract || "",
    signatureStatus: row.status || row.statut || "none",
    signatureRequestId: null,
    form: row.content?.form || row.contenu?.form || {},
  }));
};

const saveToHistory = async (entry, form) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      user_id: user.id,
      title: form.missionTitle || "Contrat",
      content: { ...entry, form, clientName: form.clientName, clientCompany: form.clientCompany, price: form.price, startDate: form.startDate, endDate: form.endDate },
      status: "none",
    })
    .select()
    .single();
  if (error) console.error("saveToHistory error:", error);
  return data;
};

const deleteFromHistory = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("contracts").delete().eq("id", id);
};

const getUserPlan = async () => {
  return { plan: "free", contractsUsed: 0 };
};

const upgradePlan = async (plan) => {};

// ─── Signature à distance ───

// Le freelance signe et prépare l'envoi au client : sauvegarde le contrat + sa signature, retourne l'id public
const createSignatureRequest = async (entry, form, freelanceSignature) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      user_id: user.id,
      title: form.missionTitle || "Contrat",
      content: {
        ...entry, form,
        clientName: form.clientName, clientCompany: form.clientCompany,
        price: form.price, startDate: form.startDate, endDate: form.endDate,
        contract: entry.contract,
        freelanceSignature: freelanceSignature || null,
        clientSignature: null,
        signedByFreelanceAt: new Date().toISOString(),
      },
      status: "pending_client",
    })
    .select()
    .single();
  if (error) { console.error("createSignatureRequest error:", error); return null; }
  return data;
};

// Le client (sans compte) charge le contrat à signer via l'id public
const getContractForSigning = async (contractId) => {
  const { data, error } = await supabase
    .from("contracts")
    .select("id, title, content, status")
    .eq("id", contractId)
    .single();
  if (error) { console.error("getContractForSigning error:", error); return null; }
  return data;
};

// Le client signe : on enregistre sa signature et on passe le statut à "signed"
const submitClientSignature = async (contractId, clientSignature) => {
  const { data: existing, error: e1 } = await supabase
    .from("contracts")
    .select("content")
    .eq("id", contractId)
    .single();
  if (e1) { console.error(e1); return false; }
  const newContent = { ...(existing.content || {}), clientSignature, signedByClientAt: new Date().toISOString() };
  const { error: e2 } = await supabase
    .from("contracts")
    .update({ content: newContent, status: "signed" })
    .eq("id", contractId);
  if (e2) { console.error(e2); return false; }
  return true;
};

const initialForm = {
  freelanceName: "", freelanceActivity: "", freelanceSiret: "", freelanceAddress: "",
  freelanceEmail: "",
  clientName: "", clientCompany: "", clientAddress: "", clientEmail: "", typeClient: "professionnel",
  missionTitle: "", missionDescription: "", categorieMetier: "autre", startDate: "", endDate: "",
  price: "", paymentTerms: "Comptant", revisions: "2", latePaymentPenalty: true, acomptePourcentage: "0",
};

const validate = (step, form) => {
  const e = {};
  if (step === 0) {
    if (!form.freelanceName.trim()) e.freelanceName = "Ton nom est obligatoire";
    if (!form.freelanceActivity.trim()) e.freelanceActivity = "Ton activité est obligatoire";
    if (!form.freelanceAddress.trim()) e.freelanceAddress = "Ton adresse est obligatoire";
    if (!form.freelanceEmail.trim()) e.freelanceEmail = "Ton email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.freelanceEmail)) e.freelanceEmail = "Email invalide";
    if (!form.clientName.trim()) e.clientName = "Le nom du client est obligatoire";
    if (!form.clientAddress.trim()) e.clientAddress = "L'adresse du client est obligatoire";
    if (!form.clientEmail.trim()) e.clientEmail = "L'email du client est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) e.clientEmail = "Email invalide";
  }
  if (step === 1) {
    if (!form.missionTitle.trim()) e.missionTitle = "Le titre est obligatoire";
    if (!form.missionDescription.trim()) e.missionDescription = "La description est obligatoire";
    if (!form.startDate) e.startDate = "La date de début est obligatoire";
    if (!form.endDate) e.endDate = "La date de fin est obligatoire";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "La date de fin doit être après le début";
  }
  if (step === 2) {
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Entre un prix valide (ex : 800)";
  }
  return e;
};

/* ══════════════════════════════════════════════════════════ CLIENT RATING MODAL ══ */
function ClientRatingModal({ clientName, clientEmail, clientCompany, onClose, onSave }) {
  const [stars, setStars]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [badges, setBadges] = useState([]);
  const [saved, setSaved]   = useState(false);

  const BADGES = ["Payeur rapide ⚡", "Super communication 💬", "Brief clair 🎯"];

  const toggleBadge = (b) => setBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const handleSave = () => {
    if (stars === 0) return;
    onSave(stars, badges);
    setSaved(true);
    setTimeout(() => onClose(), 1600);
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, background:"rgba(15,28,45,0.7)",
        zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"12px", backdropFilter:"blur(5px)",
      }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:20, padding:"24px 16px",
        maxWidth:420, width:"100%",
        boxShadow:"0 32px 80px #00000045",
        border:`1px solid ${C.border}`,
        textAlign:"center",
      }}>
        {saved ? (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🌟</div>
            <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, fontWeight:700, marginBottom:6 }}>Note enregistrée !</div>
            <div style={{ fontFamily:T.body, fontSize:13, color:C.textL }}>Merci pour votre retour sur cette mission.</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🌟</div>
              <div style={{ fontFamily:T.display, fontSize:19, fontWeight:700, color:C.navy, lineHeight:1.25, marginBottom:4 }}>
                Noter votre expérience avec {clientName || clientCompany || "ce client"}
              </div>
              {clientCompany && (
                <div style={{ fontFamily:T.body, fontSize:12, color:C.textL }}>{clientCompany}</div>
              )}
            </div>

            {/* Stars */}
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(n)}
                  style={{
                    fontSize:36, cursor:"pointer",
                    color: n <= (hovered || stars) ? "#FBBF24" : "#D1D5DB",
                    transition:"all 0.12s",
                    transform: n <= (hovered || stars) ? "scale(1.15)" : "scale(1)",
                    display:"inline-block",
                  }}
                >★</span>
              ))}
            </div>

            {stars > 0 && (
              <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginBottom:16, animation:"fadeUp 0.2s ease both" }}>
                {["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent !"][stars]}
              </div>
            )}

            {/* Badges rapides */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:600, marginBottom:10 }}>RETOURS RAPIDES (optionnel)</div>
              <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                {BADGES.map(b => (
                  <button
                    key={b}
                    onClick={() => toggleBadge(b)}
                    style={{
                      padding:"8px 14px",
                      background: badges.includes(b) ? C.navy : C.creamD,
                      color: badges.includes(b) ? C.white : C.textM,
                      border: `1.5px solid ${badges.includes(b) ? C.navy : C.border}`,
                      borderRadius:20, cursor:"pointer",
                      fontFamily:T.body, fontSize:12, fontWeight:600,
                      transition:"all 0.15s",
                      boxShadow: badges.includes(b) ? "0 3px 10px #1B2E4B25" : "none",
                    }}
                  >{b}</button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={onClose}
                style={{
                  flex:1, padding:"12px", background:C.white,
                  border:`1.5px solid ${C.border}`, borderRadius:12,
                  cursor:"pointer", fontFamily:T.body, fontSize:13,
                  fontWeight:600, color:C.textM, transition:"all 0.15s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >Plus tard</button>
              <button
                onClick={handleSave}
                disabled={stars === 0}
                style={{
                  flex:2, padding:"12px",
                  background: stars > 0 ? `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)` : C.creamDD,
                  color: stars > 0 ? C.white : C.textL,
                  border:"none", borderRadius:12,
                  cursor: stars > 0 ? "pointer" : "not-allowed",
                  fontFamily:T.body, fontSize:13, fontWeight:700,
                  boxShadow: stars > 0 ? "0 6px 20px #1B2E4B30" : "none",
                  transition:"all 0.15s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                }}
                onMouseOver={e=>{ if(stars>0){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 10px 28px #1B2E4B40"; }}}
                onMouseOut={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=stars>0?"0 6px 20px #1B2E4B30":"none"; }}
              >
                <span>⭐</span> Enregistrer la note
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ RELANCE MODAL ══ */
function RelanceModal({ msg, setMsg, onClose, onSend }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, background:"rgba(15,28,45,0.65)",
        zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"12px", backdropFilter:"blur(4px)",
        animation:"fadeUp 0.2s ease both",
      }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:20, padding:"24px 16px",
        maxWidth:500, width:"100%",
        boxShadow:"0 32px 80px #00000040",
        border:`1px solid ${C.border}`,
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:12,
              background:"linear-gradient(135deg, #065F46 0%, #059669 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 12px #05966930", flexShrink:0,
            }}>⚡</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:19, fontWeight:700, color:C.navy, lineHeight:1.2 }}>
                Personnaliser la relance client
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginTop:2 }}>
                Modifiez le message avant de l'envoyer
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width:32, height:32, borderRadius:8,
              background:C.creamD, border:`1px solid ${C.border}`,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, color:C.textL, flexShrink:0, lineHeight:1,
            }}
          >×</button>
        </div>

        {/* Textarea */}
        <div style={{ marginBottom:20 }}>
          <label style={{
            display:"block", fontFamily:T.body, fontSize:10,
            letterSpacing:"0.14em", fontWeight:700, color:C.textL,
            marginBottom:8, textTransform:"uppercase",
          }}>MESSAGE DE RELANCE</label>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            rows={6}
            style={{
              width:"100%", padding:"14px 16px",
              fontFamily:T.body, fontSize:13, color:C.text, lineHeight:1.7,
              background:C.cream, border:`1.5px solid ${C.border}`,
              borderRadius:12, resize:"vertical", outline:"none",
              minHeight:130, maxHeight:280,
              transition:"border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = C.navy}
            onBlur={e => e.target.style.borderColor = C.border}
            placeholder="Rédigez votre message de relance personnalisé…"
          />
          <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginTop:6, textAlign:"right" }}>
            {msg.length} caractère{msg.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={onClose}
            style={{
              flex:1, padding:"13px 0",
              background:C.white, border:`1.5px solid ${C.border}`,
              borderRadius:12, cursor:"pointer",
              fontFamily:T.body, fontSize:13, fontWeight:600, color:C.textM,
              transition:"all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.background = C.creamD; e.currentTarget.style.borderColor = C.navy+"66"; }}
            onMouseOut={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}
          >Annuler</button>
          <button
            onClick={onSend}
            disabled={!msg.trim()}
            style={{
              flex:2, padding:"13px 0",
              background: msg.trim()
                ? "linear-gradient(135deg, #065F46 0%, #059669 100%)"
                : C.creamDD,
              color: msg.trim() ? "#fff" : C.textL,
              border:"none", borderRadius:12,
              cursor: msg.trim() ? "pointer" : "not-allowed",
              fontFamily:T.body, fontSize:13, fontWeight:700,
              boxShadow: msg.trim() ? "0 6px 20px #05966935" : "none",
              transition:"all 0.15s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}
            onMouseOver={e => { if (msg.trim()) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 10px 28px #05966945"; }}}
            onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=msg.trim()?"0 6px 20px #05966935":"none"; }}
          >
            <span>🚀</span> Envoyer la relance personnalisée
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ HELP MODAL ══ */
const HELP_FAQ = [
  {
    q: "🔗 Mon client n'a pas reçu le lien ?",
    a: "Pas de panique ! Copiez simplement le lien de négociation et envoyez-le lui directement par SMS ou WhatsApp.",
  },
  {
    q: "📄 Comment générer la facture ?",
    a: "Une fois le contrat scellé ou l'acompte payé, un bouton de téléchargement automatique apparaît sur votre tableau de bord.",
  },
  {
    q: "⚠️ L'écran a planté ou affiche une erreur ?",
    a: "Actualisez simplement la page depuis votre navigateur (F5 ou le bouton ↺). Vos contrats déjà générés sont sauvegardés et réapparaîtront dans l'onglet « En cours ».",
  },
];

function HelpModal({ onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0,
        background:"rgba(15,28,45,0.65)",
        zIndex:99999,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"12px",
        backdropFilter:"blur(6px)",
      }}
    >
      <div
        className="fade-up"
        style={{
          background:C.white,
          borderRadius:24,
          width:"100%", maxWidth:460,
          boxShadow:"0 32px 80px #1B2E4B22",
          border:`1px solid ${C.border}`,
          overflow:"hidden",
        }}
      >
        {/* Header */}
        <div style={{
          background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
          padding:"28px 28px 24px",
          position:"relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position:"absolute", top:16, right:16,
              background:"rgba(255,255,255,0.15)", border:"none",
              borderRadius:"50%", width:32, height:32,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", color:"#fff", fontSize:16, lineHeight:1,
              transition:"background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.28)"}
            onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
          >×</button>
          <div style={{ fontSize:36, marginBottom:10 }}>⚡</div>
          <div style={{ fontFamily:T.display, fontSize:20, fontWeight:700, color:"#fff", marginBottom:6 }}>
            Besoin d'un coup de main ?
          </div>
          <div style={{ fontFamily:T.body, fontSize:13, color:"rgba(255,255,255,0.72)", lineHeight:1.55 }}>
            Les réponses aux questions les plus fréquentes sont juste en dessous.
          </div>
        </div>

        {/* FAQ accordéons */}
        <div style={{ padding:"20px 24px 24px" }}>
          <div style={{
            border:`1px solid ${C.border}`,
            borderRadius:14,
            overflow:"hidden",
            marginBottom:20,
          }}>
            {HELP_FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: i < HELP_FAQ.length - 1 ? `1px solid ${C.borderL}` : "none" }}>
                {/* Question */}
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{
                    width:"100%", padding:"15px 18px",
                    background: expanded === i ? C.creamD : C.white,
                    border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                    textAlign:"left", fontFamily:T.body,
                    transition:"background 0.15s",
                  }}
                  onMouseOver={e => { if (expanded !== i) e.currentTarget.style.background = C.creamD + "88"; }}
                  onMouseOut={e => { if (expanded !== i) e.currentTarget.style.background = C.white; }}
                >
                  <span style={{ fontSize:13, fontWeight:600, color:C.navy, lineHeight:1.45 }}>
                    {item.q}
                  </span>
                  <span style={{
                    fontSize:18, color:C.gold, flexShrink:0,
                    display:"inline-block",
                    transform: expanded === i ? "rotate(45deg)" : "none",
                    transition:"transform 0.2s",
                    lineHeight:1,
                  }}>＋</span>
                </button>
                {/* Réponse */}
                {expanded === i && (
                  <div style={{
                    padding:"4px 18px 16px",
                    background:C.creamD,
                    animation:"fadeUp 0.2s ease both",
                  }}>
                    <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.7 }}>
                      {item.a}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Note de bas */}
          <div style={{
            display:"flex", alignItems:"flex-start", gap:10,
            background:"linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
            border:"1px solid #FDE68A",
            borderRadius:12,
            padding:"14px 16px",
          }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <div style={{ fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.65 }}>
              <strong>Pas trouvé votre réponse ?</strong> La plupart des problèmes se résolvent en quelques secondes avec le bouton de réinitialisation ci-dessus.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ ERROR BOUNDARY ══ */
const FAQ_ITEMS = [
  {
    q: "Mon contrat n'apparaît plus — où est-il passé ?",
    a: "Vos contrats sont sauvegardés localement dans votre session. Cliquez sur « Relancer et corriger » ci-dessus : l'app s'ouvre directement sur l'onglet « En cours » où se trouvent tous vos contrats.",
  },
  {
    q: "L'IA ne génère plus mon contrat — que faire ?",
    a: "Vérifiez votre connexion internet, puis cliquez sur « Relancer et corriger ». Si le problème persiste après 2 tentatives, attendez 2 minutes (limite de quota API temporaire) et réessayez.",
  },
  {
    q: "Pourquoi l'application s'est-elle bloquée ?",
    a: "Un décalage d'affichage mineur a figé l'interface. Cela arrive parfois lors d'une navigation rapide entre les onglets. Vos données sont 100 % intactes — un simple rechargement suffit.",
  },
  {
    q: "J'ai payé mais je n'ai plus accès à mes contrats illimités.",
    a: "Votre accès Premium est lié à votre compte. Cliquez sur « Relancer et corriger » pour vous reconnecter, puis vérifiez que vous êtes bien connecté avec l'email utilisé lors de l'achat.",
  },
  {
    q: "Comment télécharger un contrat en PDF après un bug ?",
    a: "Relancez l'application via le bouton ci-dessus, ouvrez l'onglet « En cours », cliquez sur votre contrat, puis utilisez le bouton « Télécharger PDF ».",
  },
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, faqOpen: false, faqExpanded: null, fixed: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[Freeley] Erreur capturée :", error, info);
  }

  handleRestart = () => {
    this.setState({ fixed: true });
    setTimeout(() => {
      this.setState({ hasError: false, error: null, faqOpen: false, faqExpanded: null, fixed: false });
      // Force navigation vers l'onglet "En cours" via sessionStorage
      try { sessionStorage.setItem("freeley_goto", "encours"); } catch(_) {}
    }, 600);
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { faqOpen, faqExpanded, fixed } = this.state;

    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #F7F5F0 0%, #EDE9DF 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 480, width: "100%",
          background: "#FFFFFF",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(27,46,75,0.12)",
          border: "1px solid #D8D4CB",
          overflow: "hidden",
          animation: "fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both",
        }}>

          {/* Header band */}
          <div style={{
            background: "linear-gradient(135deg, #1B2E4B 0%, #2A4167 100%)",
            padding: "28px 32px 24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🛠️</div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#FFFFFF",
              lineHeight: 1.3, marginBottom: 8,
            }}>
              Oups, un petit décalage d'affichage s'est produit.
            </div>
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6, fontWeight: 400,
            }}>
              Rien de grave — vos données et contrats sont{" "}
              <span style={{ color: "#6EE7B7", fontWeight: 700 }}>100 % en sécurité</span> !<br />
              L'interface a juste eu un accroc. Un clic suffit pour tout remettre en ordre.
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>

            {/* Bouton principal — Relancer */}
            <button
              onClick={this.handleRestart}
              disabled={fixed}
              style={{
                width: "100%",
                padding: "16px 20px",
                background: fixed
                  ? "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)"
                  : "linear-gradient(135deg, #1B2E4B 0%, #2A4167 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                cursor: fixed ? "default" : "pointer",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "inherit",
                boxShadow: fixed ? "0 6px 20px rgba(45,106,79,0.35)" : "0 8px 28px rgba(27,46,75,0.30)",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                marginBottom: 14,
              }}
              onMouseOver={e => { if (!fixed) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(27,46,75,0.40)"; }}}
              onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = fixed ? "0 6px 20px rgba(45,106,79,0.35)" : "0 8px 28px rgba(27,46,75,0.30)"; }}
            >
              {fixed ? (
                <><span>✅</span> Application relancée — chargement…</>
              ) : (
                <><span>⚡</span> Relancer et corriger l'application</>
              )}
            </button>

            {/* Séparateur */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "#D8D4CB" }} />
              <span style={{ fontSize: 11, color: "#8A8780", fontWeight: 600, letterSpacing: "0.1em" }}>OU</span>
              <div style={{ flex: 1, height: 1, background: "#D8D4CB" }} />
            </div>

            {/* Bouton FAQ assistant */}
            <button
              onClick={() => this.setState(s => ({ faqOpen: !s.faqOpen, faqExpanded: null }))}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: faqOpen ? "#F7F5F0" : "#FFFFFF",
                color: "#1B2E4B",
                border: `2px solid ${faqOpen ? "#B8965A" : "#D8D4CB"}`,
                borderRadius: 14,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "all 0.2s",
                marginBottom: faqOpen ? 16 : 0,
              }}
              onMouseOver={e => { if (!faqOpen) { e.currentTarget.style.borderColor = "#B8965A"; e.currentTarget.style.background = "#FFFBEB"; }}}
              onMouseOut={e => { if (!faqOpen) { e.currentTarget.style.borderColor = "#D8D4CB"; e.currentTarget.style.background = "#FFFFFF"; }}}
            >
              <span>🤖</span>
              Poser une question à l'assistant IA Freeley
              <span style={{ marginLeft: "auto", fontSize: 16, color: "#8A8780", transform: faqOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </button>

            {/* Mini-FAQ déroulante */}
            {faqOpen && (
              <div style={{ animation: "fadeUp 0.25s ease both" }}>
                <div style={{
                  background: "#F7F5F0",
                  border: "1px solid #D8D4CB",
                  borderRadius: 12,
                  overflow: "hidden",
                }}>
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? "1px solid #D8D4CB" : "none" }}>
                      <button
                        onClick={() => this.setState(s => ({ faqExpanded: s.faqExpanded === i ? null : i }))}
                        style={{
                          width: "100%", padding: "13px 16px",
                          background: faqExpanded === i ? "#EDE9DF" : "transparent",
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
                          textAlign: "left", fontFamily: "inherit",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={e => { if (faqExpanded !== i) e.currentTarget.style.background = "#EDE9DF66"; }}
                        onMouseOut={e => { if (faqExpanded !== i) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2E4B", lineHeight: 1.45 }}>
                          {item.q}
                        </span>
                        <span style={{
                          fontSize: 14, color: "#8A8780", flexShrink: 0, marginTop: 1,
                          transform: faqExpanded === i ? "rotate(45deg)" : "none",
                          transition: "transform 0.2s",
                          display: "inline-block",
                        }}>＋</span>
                      </button>
                      {faqExpanded === i && (
                        <div style={{
                          padding: "0 16px 14px",
                          fontSize: 12, lineHeight: 1.7, color: "#4A4A4A",
                          animation: "fadeUp 0.2s ease both",
                          background: "#EDE9DF",
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Contact de secours */}
                <div style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
                  border: "1px solid #FDE68A",
                  borderRadius: 10,
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                  <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
                    <strong>Pas trouvé votre réponse ?</strong> Cliquez sur{" "}
                    <span style={{ fontWeight: 700 }}>« Relancer et corriger »</span> — dans 95 % des cas,
                    cela résout le problème en quelques secondes.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/* ══════════════════════════════════════════════════════════ APP ══ */
function AppInner() {
  const [step, setStep]           = useState(() => {
    const s = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step=")).split("=")[1]) : null);
    return s ? Number(s) : 0;
  });
  const [form, setForm]           = useState(() => {
    // Effacer le cookie si on arrive sans OAuth (pas de hash #access_token)
    if (!window.location.hash.includes("access_token")) {
      document.cookie = "freeley_pending_form=;path=/;max-age=0";
      document.cookie = "freeley_pending_step=;path=/;max-age=0";
    }
    return initialForm;
  });
  const [errors, setErrors]       = useState({});
  const [contract, setContract]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [apiError, setApiError]   = useState("");
  const [pdfLoading, setPdfLoad]  = useState(false);
  const [scanStep0Loading, setScanStep0Loading] = useState(false);
  const [scanStep0Success, setScanStep0Success] = useState(false);
  const [scanStep1Loading, setScanStep1Loading] = useState(false);
  const [scanStep1Success, setScanStep1Success] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [jsPDFReady, setPDFReady] = useState(false);
  const [showPaywall, setPaywall] = useState(false);
  const [isPremium, setPremium]   = useState(false);
  const [premiumPlan, setPlan]    = useState(null);
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem("freeley_screen");
    return saved && ["history","profile","pricing","scan-results","profile-gate","dashboard","cgu"].includes(saved) ? saved : "app";
  });
  const [forceAuthOnStart, setForceAuthOnStart] = useState(false);
  const [history, setHistory]     = useState([]);
  const [historyView, setHistoryView] = useState(null);
  const [animDone, setAnimDone]   = useState(false);
  const animDoneRef               = useRef(false); // ref pour lecture correcte dans les closures async
  const apiReadyRef               = useRef(null); // stocke le texte dès que l'API répond

  // Auth state
  const [authUser, setAuthUser]   = useState(null);   // supabase user object
  const [authReady, setAuthReady] = useState(false);  // true once session checked
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode]   = useState("login"); // "login" | "signup"
  const [contractsUsed, setContractsUsed] = useState(0);

  // Subscription modal state (pop-up après épuisement des 2 essais gratuits)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDepositPct, setInvoiceDepositPct] = useState(30);

  // Scanner modal state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanResultsToShow, setScanResultsToShow] = useState(null);
  const [hasScanResults, setHasScanResults] = useState(!!localStorage.getItem("freeley_scan_results"));

  const goToScreen = (s) => {
    localStorage.setItem("freeley_screen", s);
    setScreen(s);
  };

  useEffect(() => {
    const handler = () => goToScreen("scan-results");
    window.addEventListener("freeley-goto-scan", handler);
    return () => window.removeEventListener("freeley-goto-scan", handler);
  }, []);

  // ── Caméra : gestion des permissions (simulation iOS/Android) ──
  const [cameraPermission, setCameraPermission]             = useState("prompt"); // "prompt" | "granted" | "denied"
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
  const [cameraPermissionCallback, setCameraPermissionCallback]   = useState(null); // fn à appeler si accordé
  const [cameraPermissionDenied, setCameraPermissionDenied]       = useState(false);

  // Magic fill réel : caméra + extraction IA
  const [magicFillTarget, setMagicFillTarget] = useState(null); // "step0" | "step1" | null

  // Appelée par chaque bouton 📷 — gère le routage permission → scan
  const requestCameraPermission = (onGranted) => {
    if (cameraPermission === "granted") {
      // Permission déjà accordée : lancer directement
      onGranted();
    } else if (cameraPermission === "denied") {
      // Refusée précédemment : afficher le message discret
      setCameraPermissionDenied(true);
      setTimeout(() => setCameraPermissionDenied(false), 4500);
    } else {
      // Premier clic : afficher la popup de permission
      setCameraPermissionCallback(() => onGranted);
      setShowCameraPermissionModal(true);
    }
  };

  // Yousign state
  const [signModal, setSignModal]       = useState(false);
  const [signLoading, setSignLoading]   = useState(false);
  const [signError, setSignError]       = useState("");
  const [signResult, setSignResult]     = useState(null);
  const [signLinkCopied, setSignLinkCopied] = useState("");
  const [negotLinkCopied, setNegotLinkCopied] = useState(false);
  const [alertsTick, setAlertsTick] = useState(0); // force le recalcul des alertes (badge cloche) après lecture
  const [reviseOpen, setReviseOpen] = useState(false);
  const [reviseMessage, setReviseMessage] = useState("");
  const [reviseLoading, setReviseLoading] = useState(false);
  const [reviseError, setReviseError] = useState("");
  const [reviseSuccess, setReviseSuccess] = useState(false);

  // Tactile signature modal state
  const [showTactileSign, setShowTactileSign] = useState(false);
  const [remoteSignLoading, setRemoteSignLoading] = useState(false);
  const [remoteSignLink, setRemoteSignLink] = useState("");
  const [remoteSignCopied, setRemoteSignCopied] = useState(false);

  // ── Notation client (fin de mission) ──
  const [ratingModal, setRatingModal] = useState(null); // { clientName, clientEmail, clientCompany }

  const openRatingModal = (contract) => {
    setRatingModal({
      clientName: contract.form?.clientName || contract.clientName || "",
      clientEmail: contract.form?.clientEmail || "",
      clientCompany: contract.form?.clientCompany || contract.clientCompany || "",
    });
  };

  const handleSaveRating = (stars, badges) => {
    if (!ratingModal) return;
    saveClientRating(ratingModal.clientEmail, ratingModal.clientName, ratingModal.clientCompany, stars, badges);
    setRatingModal(null);
  };

  // ── Centre d'aide ──
  const [showHelp, setShowHelp] = useState(false);

  // ── Avenant (amendment) modal state ──
  const [showAvenantModal, setShowAvenantModal] = useState(false);
  const [avenantCount, setAvenantCount] = useState(0);

  // ── Actions Instantanées IA ──
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [showRecouvrementModal, setShowRecouvrementModal] = useState(false);

  // ── Toast relance globale ──
  const [relanceToast, setRelanceToast] = useState(false);
  const showRelanceToast = () => {
    setRelanceToast(true);
    setTimeout(() => setRelanceToast(false), 4000);
  };

  // ── Modale relance personnalisée ──
  const DEFAULT_RELANCE_MSG = "Bonjour, je vous informe que notre contrat pour la mission est prêt et en attente de votre validation sur Freeley. À très vite !";
  const [relanceModal, setRelanceModal] = useState(false);
  const [relanceMsg, setRelanceMsg] = useState(DEFAULT_RELANCE_MSG);
  const openRelanceModal = () => {
    setRelanceMsg(DEFAULT_RELANCE_MSG);
    setRelanceModal(true);
  };
  const sendRelance = () => {
    setRelanceModal(false);
    setRelanceToast(true);
    setTimeout(() => setRelanceToast(false), 4000);
  };

  // ── Profil freelance ──
  const [profile, setProfile] = useState(() => {
    const base = {
      firstName: "", lastName: "", jobTitle: "", bio: "", tjm: "",
      siret: "", linkedin: "", portfolio: "", github: "",
      skills: [], photo: null, verified: false,
      companyName: "", legalStatus: "", tvaNumber: "", address: "",
      iban: "", bic: "", bankName: "", logo: null,
    };
    try {
      const saved = localStorage.getItem("freeley_profile");
      if (saved) return { ...base, ...JSON.parse(saved) };
    } catch(e) {}
    return base;
  });
  const updateProfile = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  // ── Init : session mock + données utilisateur ──
  useEffect(() => {
    if (window.jspdf) { setPDFReady(true); }
    else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => setPDFReady(true);
      document.head.appendChild(s);
    }
    // Vérifie la session existante (ex: après redirect Google)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadUserData(session.user);
        const urlParams = new URLSearchParams(window.location.search);
        const fromScanner = urlParams.get("from") === "scanner" || localStorage.getItem("freeley_scan_pending") === "1";
        if (fromScanner) {
          localStorage.removeItem("freeley_scan_pending");
          window.history.replaceState({}, "", window.location.pathname);
          goToScreen("scan-results");
        }
        // Restaurer formulaire sauvegardé après OAuth Google
        // Restaurer formulaire depuis IndexedDB après OAuth Google
        await new Promise((resolve) => {
          try {
            const req = indexedDB.open("freeley_db", 2);
            req.onupgradeneeded = e => e.target.result.createObjectStore("pending");
            req.onsuccess = e => {
              const db = e.target.result;
              const tx = db.transaction("pending", "readonly");
              const store = tx.objectStore("pending");
              const getForm = store.get("form");
              const getStep = store.get("step");
              tx.oncomplete = () => {
                const f = getForm.result;
                const s = getStep.result;
                if (f) {
                  try { setForm(JSON.parse(f)); setStep(Number(s) || 0); } catch(e) {}
                  // Effacer IndexedDB
                  const tx2 = db.transaction("pending", "readwrite");
                  tx2.objectStore("pending").delete("form");
                  tx2.objectStore("pending").delete("step");
                  goToScreen("app");
                  setAuthReady(true);
                }
                resolve();
              };
            };
            req.onerror = () => resolve();
          } catch(e) { resolve(); }
        });
        localStorage.removeItem("freeley_screen");
        if (localStorage.getItem("freeley_pending_import") === "1") {
          localStorage.removeItem("freeley_pending_import");
          const scanData = localStorage.getItem("freeley_scan_results");
          if (scanData) {
            try {
              const parsed = JSON.parse(scanData);
              const ext = parsed.extractedData || {};
                  localStorage.removeItem("freeley_scan_results");
              setHasScanResults(false);
            } catch(e) {}
          }
          goToScreen("history");
        }
      }
      setAuthReady(true);
    });

    // Écoute les changements de session (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") {
        goToScreen("reset-password");
        return;
      }
      if (session?.user) {
        setAuthUser(session.user);
        loadUserData(session.user);
        console.log("onAuthStateChange fired, from_scanner:", localStorage.getItem("freeley_from_scanner"));
        if (localStorage.getItem("freeley_from_scanner") === "1") {
          localStorage.removeItem("freeley_from_scanner");
          goToScreen("scan-results");
          return;
        }
        // Restaurer formulaire après OAuth Google
        const _pf = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form=")).split("=")[1]) : null);
        const _ps = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step=")).split("=")[1]) : null);
        if (_pf) {
          try { setForm(JSON.parse(_pf)); setStep(Number(_ps) || 0); } catch(e) {}
          document.cookie = "freeley_pending_form=;path=/;max-age=0";
          document.cookie = "freeley_pending_step=;path=/;max-age=0";
          goToScreen("app");
          return;
        }
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // Redirige vers "En cours" si relancé depuis l'écran de crash
    try {
      const goto = sessionStorage.getItem("freeley_goto");
      if (goto === "encours") {
        sessionStorage.removeItem("freeley_goto");
        goToScreen("history");
      }
    } catch(_) {}
  }, []);

  const loadUserData = async (user) => {
    const { plan, contractsUsed: used } = await getUserPlan();
    const isPrem = plan !== "free";
    setPremium(isPrem);
    setPlan(isPrem ? plan : null);
    setContractsUsed(used);
    const hist = await getHistory();
    setHistory(hist);
  };

  // Sync profil → form (step 0) quand le profil change
  useEffect(() => {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    if (fullName) setForm(f => ({ ...f, freelanceName: fullName }));
    if (profile.jobTitle) setForm(f => ({ ...f, freelanceActivity: profile.jobTitle }));
    if (profile.siret) setForm(f => ({ ...f, freelanceSiret: profile.siret }));
  }, [profile.firstName, profile.lastName, profile.jobTitle, profile.siret]);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const magicFillStep0 = () => setMagicFillTarget("step0");
  const magicFillStep1 = () => setMagicFillTarget("step1");

  // Extraction réelle via Claude Vision après capture photo
  const handleMagicFillCapture = async ({ base64, type }) => {
    const target = magicFillTarget;
    setMagicFillTarget(null);
    if (target === "step0") { setScanStep0Loading(true); setScanStep0Success(false); }
    else { setScanStep1Loading(true); setScanStep1Success(false); }

    const champsDemandes = target === "step0"
      ? `- freelanceName (nom complet du prestataire/freelance)
- freelanceActivity (son activité/métier)
- freelanceSiret (numéro SIRET si présent)
- freelanceAddress (adresse postale du prestataire)
- freelanceEmail (email du prestataire)
- clientName (nom du client)
- clientCompany (société du client si présente)
- clientAddress (adresse du client)
- clientEmail (email du client)`
      : `- missionTitle (titre court de la mission)
- missionDescription (description détaillée de la prestation)
- price (montant total HT en chiffres uniquement, sans symbole)
- startDate (date de début au format AAAA-MM-JJ)
- endDate (date de fin au format AAAA-MM-JJ)`;

    const prompt = `Tu analyses la photo d'un document professionnel (devis, facture, carte de visite, email, brief...). Extrais les informations pour remplir un formulaire de contrat freelance. Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant/après, pas de balises markdown) contenant EXACTEMENT ces clés :
${champsDemandes}

Pour chaque champ non trouvé dans le document, mets une chaîne vide "". N'invente jamais d'information.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: type || "image/jpeg", data: base64 } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      let txt = (data.content || []).map(b => b.text || "").join("").trim();
      txt = txt.replace(/```json|```/g, "").trim();
      const extracted = JSON.parse(txt);
      // Remplir uniquement les champs non vides
      setForm(prev => {
        const next = { ...prev };
        Object.keys(extracted).forEach(k => {
          if (extracted[k] && String(extracted[k]).trim() && k in next) {
            next[k] = String(extracted[k]).trim();
          }
        });
        return next;
      });
      if (target === "step0") {
        setScanStep0Loading(false); setScanStep0Success(true);
        setTimeout(() => setScanStep0Success(false), 3500);
      } else {
        setScanStep1Loading(false); setScanStep1Success(true);
        setTimeout(() => setScanStep1Success(false), 3500);
      }
    } catch(e) {
      if (target === "step0") setScanStep0Loading(false);
      else setScanStep1Loading(false);
      alert("Impossible de lire le document. Réessaie avec une photo plus nette ou remplis les champs manuellement.");
    }
  };

  const handleNext = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step < 2) { setStep(s => s + 1); return; }
    // Obliger la connexion avant de générer
    if (!authUser) {
      // Sauvegarder directement dans IndexedDB
      try {
        const req = indexedDB.open("freeley_db", 2);
        req.onupgradeneeded = e => e.target.result.createObjectStore("pending");
        req.onsuccess = e => {
          const db = e.target.result;
          const tx = db.transaction("pending", "readwrite");
          tx.objectStore("pending").put(JSON.stringify(form), "form");
          tx.objectStore("pending").put(String(step), "step");
        };
      } catch(e) {}
      setShowAuthModal(true); setAuthMode("signup"); return;
    }
    // Limite gratuite → pop-up abonnement
    if (!isPremium && contractsUsed >= FREE_LIMIT) { setShowSubscriptionModal(true); return; }
    generateContract();
  };

  const handlePurchase = async (plan) => {
    await upgradePlan(plan);
    setPremium(true); setPlan(plan);
    setPaywall(false);
    setShowSubscriptionModal(false);
    goToScreen("app");
    generateContract();
  };

  // ── Transition propre vers l'écran contrat ──
  const doTransition = useRef(null);
  doTransition.current = (text) => {
    setContract(text);
    setStep(3);
    setLoadingPhase(0);
    setLoading(false);
    setAnimDone(false);
    animDoneRef.current = false;
    apiReadyRef.current = null;
  };

  const generateContract = async () => {
    setLoading(true);
    setApiError("");
    setLoadingPhase(1);
    setAnimDone(false);
    animDoneRef.current = false;
    apiReadyRef.current = null;

    const t1 = setTimeout(() => setLoadingPhase(2), 600);
    const t2 = setTimeout(() => setLoadingPhase(3), 1300);

    try {
      const d1 = form.startDate ? new Date(form.startDate).toLocaleDateString("fr-FR") : "Non défini";
      const d2 = form.endDate   ? new Date(form.endDate).toLocaleDateString("fr-FR")   : "Non défini";
      const paymentTermsLabel = form.paymentTerms === "Comptant"
        ? "comptant à la commande (100 % à la signature)"
        : `${form.paymentTerms} jours nets à compter de la date de facturation`;
      const acomptePct = Number(form.acomptePourcentage) || 0;
      const acompteAmount = Math.round(Number(form.price) * acomptePct / 100);
      const soldeAmount   = Math.round(Number(form.price) * (100 - acomptePct) / 100);

      const prompt = `Tu es un avocat d'affaires français spécialisé en droit des contrats de prestation intellectuelle et en propriété intellectuelle. Rédige un CONTRAT DE PRESTATION DE SERVICES INDÉPENDANT complet, à la fois rigoureux sur le plan juridique et protecteur pour le Prestataire, en français, en utilisant EXACTEMENT les informations fournies ci-dessous.

══════════════════════════════════════════════
DONNÉES DE LA MISSION
══════════════════════════════════════════════
Prestataire        : ${form.freelanceName}
Activité           : ${form.freelanceActivity}${form.freelanceSiret ? "\nSIRET             : " + form.freelanceSiret : ""}
Adresse Prestataire: ${form.freelanceAddress}
Email Prestataire  : ${form.freelanceEmail || "—"}

Client             : ${form.clientName}${form.clientCompany ? " — " + form.clientCompany : ""}
Type de client     : ${form.typeClient === "particulier" ? "PARTICULIER (B2C)" : "PROFESSIONNEL / ENTREPRISE (B2B)"}
Adresse Client     : ${form.clientAddress}
Email Client       : ${form.clientEmail || "—"}

Titre de la mission: ${form.missionTitle}
Domaine d'activité : ${form.categorieMetier === "artisanat" ? "Métier manuel / artisanat" : form.categorieMetier === "digital" ? "Digital / Tech / Création" : form.categorieMetier === "conseil" ? "Conseil / Formation / Services" : "Autre / prestation générale"}
Description        : ${form.missionDescription}
Période            : du ${d1} au ${d2}
Honoraires HT      : ${form.price} €
Conditions paiement: ${paymentTermsLabel}
Révisions incluses : ${form.revisions} aller(s)-retour(s)
Pénalités de retard: ${form.latePaymentPenalty ? "OUI (clause légale obligatoire Art. L441-10 C.com.)" : "NON"}

══════════════════════════════════════════════
STRUCTURE OBLIGATOIRE — RESPECTE CET ORDRE EXACT
══════════════════════════════════════════════

EN-TÊTE : Titre "CONTRAT DE PRESTATION DE SERVICES INDÉPENDANT", date du jour en toutes lettres, numéro de contrat format CP-[AAAA]-[XXXX] (génère un numéro aléatoire 4 chiffres), mention "ENTRE LES SOUSSIGNÉS".

ARTICLE 1 — INDÉPENDANCE DU PRESTATAIRE ET ABSENCE DE LIEN DE SUBORDINATION
Rédige une clause affirmant EXPLICITEMENT que :
- Le Prestataire exerce son activité en toute indépendance et autonomie ;
- Il conserve l'entière liberté de choix de ses horaires de travail, de son matériel, de ses méthodes et de son organisation ;
- Le présent contrat ne crée en aucun cas un lien de subordination au sens du droit du travail (art. L1221-1 C.trav.) ;
- Le Prestataire peut exercer d'autres missions simultanément pour d'autres clients ;
- Le Client s'interdit expressément toute directive, instruction ou contrôle portant sur les moyens d'exécution.
Cite l'article L1221-1 du Code du travail et la jurisprudence Soc. 13 nov. 1996 sur le faisceau d'indices.

ARTICLE 2 — OBJET DU CONTRAT ET DESCRIPTION DE LA MISSION
Objet général + description détaillée de la mission et des livrables attendus.

ARTICLE 3 — DÉLAIS, PLANNING ET PROCÉDURE DE VALIDATION (RECETTE)
Rédige les dates de début/fin. Puis inclus OBLIGATOIREMENT cette clause de recette :
"À compter de la livraison de chaque livrable, le Client dispose d'un délai de SEPT (7) JOURS OUVRÉS pour formuler par écrit (email avec accusé de réception) ses observations ou réserves motivées et circonstanciées. À l'expiration de ce délai sans retour écrit du Client, la prestation est réputée définitivement acceptée sans réserve, valant recette tacite et ouvrant droit à la facturation du solde correspondant. Les retours oraux ou non circonstanciés ne seront pas pris en compte."

ARTICLE 4 — HONORAIRES, MODALITÉS DE PAIEMENT ET ACOMPTE
Montant total HT : ${form.price} €
Inclure OBLIGATOIREMENT :
${acomptePct > 0
  ? `- Un acompte de ${acomptePct} % soit ${acompteAmount} € HT dû à la signature du présent contrat, dont le versement conditionne le démarrage de la mission (condition suspensive) ;
- Le solde de ${100 - acomptePct} % soit ${soldeAmount} € HT exigible à la livraison/recette finale de la mission, payable selon le délai convenu (${paymentTermsLabel}). Ne JAMAIS indiquer que le solde est "comptant à la commande" ou "à la signature" puisqu'un acompte est demandé ;`
  : `- Aucun acompte n'est demandé. La totalité des honoraires, soit 100 % du montant (${form.price} € HT), est due selon le délai de paiement convenu : ${paymentTermsLabel} ;`}
${form.latePaymentPenalty
  ? (form.typeClient === "particulier"
    ? `- Le client étant un PARTICULIER (B2C), la clause de pénalités de retard doit IMPÉRATIVEMENT utiliser le taux d'intérêt légal en vigueur en France applicable aux consommateurs (et non le Code de commerce ni l'indemnité forfaitaire de 40 €, strictement réservés aux professionnels) : "En cas de retard de paiement, des pénalités calculées au taux d'intérêt légal en vigueur seront appliquées de plein droit sur les sommes dues, conformément au droit de la consommation."`
    : `- La clause légale de pénalités de retard réservée aux professionnels : "Conformément aux articles L441-10 et L441-11 du Code de commerce, toute somme non réglée à l'échéance portera de plein droit, sans mise en demeure préalable, des pénalités de retard calculées au taux directeur de la Banque Centrale Européenne (taux REFI) majoré de dix (10) points de pourcentage, appliqué au montant TTC de la facture impayée et courant dès le lendemain de la date d'échéance. En sus, une indemnité forfaitaire de quarante euros (40 €) pour frais de recouvrement sera exigible de plein droit (art. D441-5 C.com.). Si les frais de recouvrement effectivement engagés excèdent ce montant forfaitaire, le Prestataire se réserve le droit de réclamer une indemnisation complémentaire sur justificatifs."`)
  : `- Indique explicitement : "Pénalités de retard : Non stipulées."`}
- Toutes les sommes sont exprimées hors taxes ; la TVA applicable, le cas échéant, sera ajoutée au taux en vigueur.

ARTICLE 5 — RÉVISIONS ET MODIFICATIONS DU PÉRIMÈTRE
Nombre de révisions incluses : ${form.revisions}. Clause de gestion du "scope creep" : toute demande hors périmètre fait l'objet d'un avenant écrit et facturé au tarif horaire du Prestataire.

ARTICLE 6 — ${form.categorieMetier === "artisanat" ? "GARANTIE DE BONNE EXÉCUTION ET CONFORMITÉ AUX NORMES MÉTIER" : "PROPRIÉTÉ INTELLECTUELLE ET CESSION DES DROITS SUSPENDUE AU PAIEMENT"}
${form.categorieMetier === "artisanat"
  ? `Le métier étant manuel/artisanal (bâtiment, électricité, plomberie, logistique...), NE PAS rédiger d'article sur la propriété intellectuelle. Rédige à la place une clause de "Garantie de bonne exécution et conformité aux normes métier" : le Prestataire garantit la conformité de son intervention aux normes en vigueur applicables à son métier (le cas échéant, citer la norme NF C 15-100 pour l'électricité ou la norme sectorielle pertinente), s'engage à respecter les règles de l'art et les obligations de sécurité, et reste responsable des malfaçons selon les garanties légales applicables (garantie de parfait achèvement, garantie biennale ou décennale selon la nature des travaux).`
  : form.categorieMetier === "conseil"
  ? `Le métier étant du conseil/formation/services intellectuels, rédige un article de "Propriété intellectuelle et Confidentialité (NDA)" : les livrables (rapports, supports, recommandations) restent la propriété du Prestataire jusqu'au paiement intégral ; le Prestataire est tenu à une obligation de confidentialité stricte sur les informations du Client, et inversement le Client s'engage à ne pas divulguer les méthodologies propres du Prestataire. Précise qu'il s'agit d'une obligation de moyens et non de résultat.`
  : `Rédige cette clause en deux temps :
(a) Droits du Prestataire pendant la mission : le Prestataire conserve tous ses droits de propriété intellectuelle sur les livrables jusqu'au paiement intégral ;
(b) Cession conditionnelle et suspensive : "Le transfert définitif et irrévocable de l'ensemble des droits de propriété intellectuelle afférents aux livrables — droits de reproduction, de représentation, d'adaptation, de traduction, sous toutes formes et sur tous supports, connus ou à naître, pour le monde entier et pour toute la durée légale de protection — est STRICTEMENT SUBORDONNÉ au paiement intégral et effectif du montant total des honoraires dus au titre du présent contrat, toutes factures confondues. En cas de non-paiement, total ou partiel, le Client ne disposera d'aucun droit d'utilisation sur les livrables et devra en cesser immédiatement l'exploitation sous peine de contrefaçon (art. L335-2 et s. CPI)."
Cite les articles L111-1, L122-1 et L131-1 du Code de la propriété intellectuelle.`}

ARTICLE 7 — CONFIDENTIALITÉ ET NON-SOLICITATION
Clause de confidentialité réciproque pendant la mission et 3 ans après. Clause de non-sollicitation du personnel du Prestataire pendant 24 mois.

ARTICLE 8 — RESPONSABILITÉ DU PRESTATAIRE — OBLIGATION DE MOYENS ET PLAFONNEMENT
Rédige OBLIGATOIREMENT :
"Le Prestataire est soumis à une OBLIGATION DE MOYENS au sens du droit civil français : il s'engage à mettre en œuvre tous les moyens raisonnables et les compétences professionnelles requises pour atteindre les objectifs de la mission, sans garantir un résultat déterminé. La responsabilité du Prestataire ne pourra être engagée qu'en cas de faute prouvée par le Client. En tout état de cause, la responsabilité totale et cumulée du Prestataire au titre du présent contrat est PLAFONNÉE au montant total des honoraires effectivement perçus par le Prestataire pour la mission considérée, à l'exclusion de tout préjudice indirect, perte de chiffre d'affaires, perte de données ou préjudice commercial."

ARTICLE 9 — RÉSILIATION
Conditions de résiliation par l'une ou l'autre des parties. En cas de résiliation par le Client, l'acompte versé reste acquis au Prestataire à titre d'indemnité forfaitaire. En cas de résiliation par le Prestataire pour faute du Client, les sommes dues pour les prestations réalisées sont immédiatement exigibles.

ARTICLE 10 — FORCE MAJEURE
Clause standard de force majeure conforme à l'art. 1218 du Code civil.

ARTICLE 11 — DROIT APPLICABLE, MÉDIATION ET ATTRIBUTION DE JURIDICTION
Droit français. En cas de litige, les parties s'engagent à tenter une médiation avant toute action judiciaire. Attribution de compétence au Tribunal de commerce ou au Tribunal judiciaire compétent du ressort du domicile du Prestataire.

ARTICLE 12 — DISPOSITIONS GÉNÉRALES
Intégralité de l'accord, divisibilité des clauses, absence de renonciation, hiérarchie des documents contractuels.

ARTICLE 13 — SIGNATURES
Bloc de signature avec : "Lu et approuvé — Bon pour accord", Nom, Qualité, Date, Lieu, Signature — pour chacune des deux parties. Espace de signature physique (ligne de tirets). Mention : "Parapher chaque page." Termine impérativement par la mention : "Contrat établi et signé par voie électronique, un exemplaire numérique original étant conservé par chaque partie."

══════════════════════════════════════════════
CONSIGNES DE RÉDACTION
══════════════════════════════════════════════
- Commence DIRECTEMENT par l'en-tête du contrat, sans introduction ni commentaire.
- Rédige chaque article avec des sous-paragraphes numérotés (ex : 4.1, 4.2…) pour la lisibilité.
- Utilise un registre juridique français précis, sans jargon inutile mais avec la rigueur d'un acte d'avocat.
- Cite systématiquement les fondements légaux (articles de loi) entre parenthèses.
- Ne laisse AUCUN champ vide ou à compléter : utilise toutes les données fournies.
- Le contrat doit être immédiatement utilisable, sans modification, par un freelance non-juriste.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 5000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const text = (data.content || []).map(i => i.text || "").join("\n").trim();
      if (!text) throw new Error("Réponse vide — content: " + JSON.stringify(data.content));

      // Sauvegarder dans l'historique
      await saveToHistory({ contract: text }, form);
      setContractsUsed(c => c + 1);
      setHistory(await getHistory());

      // Stocker le texte + signaler au composant enfant que l'API est prête
      apiReadyRef.current = text;
      setAnimDone(true); // déclenche le re-render → ContractLivePreview reçoit apiReady=true

    } catch (err) {
      console.error("[Freeley] Erreur génération:", err);
      setApiError("Erreur lors de la génération. Vérifie ta connexion et réessaie.");
      setLoadingPhase(0);
      setLoading(false);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleRemoteSign = async () => {
    setRemoteSignLoading(true);
    try {
      const entry = {
        contract,
        missionTitle: form.missionTitle,
        clientName: form.clientName,
        clientCompany: form.clientCompany,
        price: form.price,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      const saved = await createSignatureRequest(entry, form, null);
      if (!saved || !saved.id) {
        alert("Impossible de créer le lien de signature. Vérifie ta connexion.");
        setRemoteSignLoading(false);
        return;
      }
      const link = `${window.location.origin}${window.location.pathname}?sign=${saved.id}`;
      setRemoteSignLink(link);
      // Rafraîchir l'historique
      setHistory(await getHistory());
    } catch(e) {
      alert("Erreur : " + (e.message || "inconnue"));
    } finally {
      setRemoteSignLoading(false);
    }
  };

  const reviseContract = async () => {
    if (!reviseMessage.trim()) { setReviseError("Colle d'abord le retour du client."); return; }
    setReviseLoading(true);
    setReviseError("");
    setReviseSuccess(false);
    try {
      const prompt = `Tu es un avocat d'affaires français. Voici un contrat de prestation de services qui n'est PAS ENCORE SIGNÉ, donc modifiable librement.

CONTRAT ACTUEL :
${contract}

RETOUR DU CLIENT (ses demandes de modification avant signature) :
"${reviseMessage.trim()}"

Ta tâche : réécris le contrat COMPLET en intégrant les demandes légitimes du client, tout en gardant le prestataire protégé. Garde exactement la même structure, la même mise en forme et le même style que le contrat original (mêmes articles numérotés, mêmes titres). Modifie uniquement ce qui est concerné par le retour du client. Si une demande est déraisonnable ou dangereuse pour le prestataire, adapte-la de façon équilibrée plutôt que de la refuser.

Réponds UNIQUEMENT avec le texte du contrat modifié, sans aucun commentaire avant ou après, sans backticks.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 5000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const newContract = (data.content || []).map(i => i.text || "").join("").trim();
      if (!newContract) throw new Error("Réponse vide");
      setContract(newContract);
      setReviseSuccess(true);
      setReviseMessage("");
      setTimeout(() => { setReviseSuccess(false); setReviseOpen(false); }, 2600);
    } catch(e) {
      setReviseError("Erreur lors de la révision. Vérifie ta connexion et réessaie.");
    } finally {
      setReviseLoading(false);
    }
  };

  const copyContract = () => {
    navigator.clipboard.writeText(contract).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Yousign : envoyer pour signature ──
  const sendForSignature = async () => {
    setSignLoading(true); setSignError("");
    try {
      const YOUSIGN_API_KEY = (typeof window !== "undefined" && window.__YOUSIGN_API_KEY__) || "";
      const YOUSIGN_BASE = "https://api-sandbox.yousign.app/v3"; // sandbox; prod: https://api.yousign.app/v3

      if (!YOUSIGN_API_KEY) throw new Error("Clé API Yousign manquante. Ajoute VITE_YOUSIGN_API_KEY dans ton .env");

      // 1. Créer la signature request
      const reqBody = {
        name: `Contrat — ${form.missionTitle}`,
        delivery_mode: "email",
        signers: [
          {
            info: { first_name: form.freelanceName.split(" ")[0], last_name: form.freelanceName.split(" ").slice(1).join(" ") || form.freelanceName, email: form.freelanceEmail },
            signature_level: "electronic_signature",
            signature_authentication_mode: "no_otp",
          },
          {
            info: { first_name: form.clientName.split(" ")[0], last_name: form.clientName.split(" ").slice(1).join(" ") || form.clientName, email: form.clientEmail },
            signature_level: "electronic_signature",
            signature_authentication_mode: "no_otp",
          },
        ],
        timezone: "Europe/Paris",
        email_notification: { sender: { name: "Freeley" } },
      };

      const reqRes = await fetch(`${YOUSIGN_BASE}/signature_requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${YOUSIGN_API_KEY}` },
        body: JSON.stringify(reqBody),
      });
      if (!reqRes.ok) { const e = await reqRes.json(); throw new Error(e.detail || `Erreur ${reqRes.status}`); }
      const reqData = await reqRes.json();
      const requestId = reqData.id;

      // 2. Upload le document (contrat en texte brut encodé en base64)
      const encoder = new TextEncoder();
      const contractBytes = encoder.encode(contract);
      const base64 = btoa(String.fromCharCode(...contractBytes));

      const docRes = await fetch(`${YOUSIGN_BASE}/signature_requests/${requestId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${YOUSIGN_API_KEY}` },
        body: JSON.stringify({
          nature: "signable_document",
          name: `Contrat_${form.missionTitle.replace(/[^a-zA-Z0-9]/g,"_").substring(0,30)}.txt`,
          content: base64,
          signature_fields: reqData.signers?.map((s, i) => ({
            signer_id: s.id,
            type: "signature",
            page: 1,
            x: 50 + i * 200,
            y: 700,
            width: 150,
            height: 50,
          })) || [],
        }),
      });
      if (!docRes.ok) { const e = await docRes.json(); throw new Error(e.detail || `Erreur upload doc ${docRes.status}`); }

      // 3. Activer la demande
      const activateRes = await fetch(`${YOUSIGN_BASE}/signature_requests/${requestId}/activate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${YOUSIGN_API_KEY}` },
      });
      if (!activateRes.ok) { const e = await activateRes.json(); throw new Error(e.detail || `Erreur activation ${activateRes.status}`); }
      const activated = await activateRes.json();

      // 4. Récupérer les liens de signature
      const signersLinks = activated.signers?.map(s => ({
        email: s.info?.email,
        name: `${s.info?.first_name || ""} ${s.info?.last_name || ""}`.trim(),
        link: s.signature_link,
      })) || [];

      setSignResult({ requestId, signerLinks: signersLinks });

      // Mettre à jour le statut dans Supabase (dernier contrat de l'historique)
      if (history[0]?.id && authUser?.id) {
        await supabase
          .from("contracts")
          .update({ signature_status: "pending", signature_request_id: requestId })
          .eq("id", history[0].id)
          .eq("user_id", authUser.id); // Sécurité : interdit la modification d'un contrat appartenant à un autre user
        const hist = await getHistory();
        setHistory(hist);
      }

    } catch(err) {
      setSignError(err.message || "Erreur lors de l'envoi. Vérifie ta clé API Yousign.");
    }
    setSignLoading(false);
  };

  const downloadPDF = (overrideForm, overrideContract) => {
    const rawForm = overrideForm || form;
    const pForm = {
      freelanceName: "", freelanceActivity: "", freelanceSiret: "", freelanceAddress: "",
      freelanceEmail: "", clientName: "", clientCompany: "", clientAddress: "",
      clientEmail: "", missionTitle: "", missionDescription: "", startDate: "",
      endDate: "", price: "", paymentTerms: "", revisions: "", latePaymentPenalty: false,
      acomptePourcentage: "0", typeClient: "professionnel", categorieMetier: "autre",
      ...rawForm,
    };
    const pContract = overrideContract || contract;
    if (!jsPDFReady || !window.jspdf) { alert("PDF en cours de chargement, réessaie."); return; }
    if (!overrideForm) setPdfLoad(true);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const PW = 210, PH = 297;
      const ML = 22, MR = 22, cw = PW - ML - MR;
      const HEADER_H = 16, FOOTER_H = 14, BODY_TOP = HEADER_H + 8, BODY_BOT = PH - FOOTER_H - 6;

      // ── Palette document premium ──
      const NAVY   = [26, 54, 93];    // #1a365d
      const NAVYL  = [43, 108, 176];  // #2b6cb0
      const NAVYLT = [235, 241, 250]; // fond bleu très clair
      const DARK   = [44, 62, 80];    // #2c3e50
      const GOLD   = [180, 140, 70];
      const AMBER  = [255, 248, 230]; // fond encadré clause
      const AMBER_BORDER = [214, 132, 49]; // bordure orange
      const WHITE  = [255, 255, 255];
      const GREY   = [140, 140, 140];
      const GREYLT = [220, 220, 220];
      const GREEN  = [39, 119, 63];   // badge scellé

      const safe = s => (s||"").replace(/[^a-zA-Z0-9]/g,"_").substring(0,25);
      const d1 = pForm.startDate ? new Date(pForm.startDate).toLocaleDateString("fr-FR") : "Non défini";
      const d2 = pForm.endDate   ? new Date(pForm.endDate).toLocaleDateString("fr-FR")   : "Non défini";
      const today = new Date().toLocaleDateString("fr-FR");

      /* ── HEADER (pages intérieures) ── */
      const drawHeader = () => {
        // Bande bleue marine fine en haut
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, PW, HEADER_H, "F");
        // Filet doré sous la bande
        doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
        doc.line(0, HEADER_H, PW, HEADER_H);
        // Titre gauche
        doc.setFont("helvetica","bold"); doc.setFontSize(7.5);
        doc.setTextColor(...WHITE);
        doc.text("CONTRAT DE PRESTATION DE SERVICES INDÉPENDANT", ML, 10.5);
        // Marque droite
        doc.setFont("helvetica","normal"); doc.setFontSize(7);
        doc.setTextColor(180, 200, 230);
        doc.text("Freeley", PW - MR, 10.5, { align:"right" });
      };

      /* ── FOOTER ── */
      const drawFooter = (pageNum, total) => {
        doc.setDrawColor(...GREYLT); doc.setLineWidth(0.3);
        doc.line(ML, PH - FOOTER_H + 1, PW - MR, PH - FOOTER_H + 1);
        doc.setFont("helvetica","italic"); doc.setFontSize(6.5);
        doc.setTextColor(...GREY);
        doc.text(`Généré le ${today} via Freeley — Document indicatif, à valider par un professionnel pour missions importantes.`, ML, PH - FOOTER_H + 6);
        doc.setFont("helvetica","bold"); doc.setFontSize(7);
        doc.setTextColor(...NAVYL);
        doc.text(`Page ${pageNum} / ${total}`, PW - MR, PH - FOOTER_H + 6, { align:"right" });
      };

      /* ══════════════════════════════════════════
         PAGE DE GARDE — STYLE PREMIUM
      ══════════════════════════════════════════ */

      // Fond blanc pur
      doc.setFillColor(...WHITE); doc.rect(0, 0, PW, PH, "F");

      // Bande bleue marine haute (40 mm)
      doc.setFillColor(...NAVY); doc.rect(0, 0, PW, 46, "F");

      // Filet doré sous la bande
      doc.setDrawColor(...GOLD); doc.setLineWidth(1.2);
      doc.line(0, 46, PW, 46);

      // Liseré latéral gauche bleu accent (toute la page)
      doc.setFillColor(...NAVYL);
      doc.rect(0, 0, 5, PH, "F");

      // Marque Freeley (dans la bande)
      doc.setFont("helvetica","bold"); doc.setFontSize(8);
      doc.setTextColor(160, 190, 230);
      doc.text("FREELEY", ML + 2, 14, { charSpace: 2 });
      // Séparateur doré fin
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
      doc.line(ML + 2, 16.5, ML + 42, 16.5);

      // Titre principal (dans la bande)
      doc.setFont("helvetica","bold"); doc.setFontSize(22);
      doc.setTextColor(...WHITE);
      doc.text("CONTRAT DE PRESTATION", ML + 2, 29);
      doc.setFontSize(16);
      doc.setTextColor(180, 210, 240);
      doc.text("DE SERVICES INDÉPENDANT", ML + 2, 38.5);

      // Numéro de contrat (coin droit de la bande)
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
      doc.setTextColor(160, 190, 230);
      doc.text("Réf. document", PW - MR, 20, { align:"right" });
      doc.setFont("helvetica","bold"); doc.setFontSize(9);
      doc.setTextColor(...WHITE);
      doc.text(`${safe(pForm.missionTitle)}_${safe(pForm.clientName)}`, PW - MR, 28, { align:"right" });
      doc.setFont("helvetica","normal"); doc.setFontSize(7);
      doc.setTextColor(180, 210, 240);
      doc.text(`Fait le ${today}`, PW - MR, 35, { align:"right" });

      // ── Bloc titre mission (sous la bande) ──
      let cy = 58;
      doc.setFont("helvetica","bold"); doc.setFontSize(7);
      doc.setTextColor(...NAVYL);
      doc.text("OBJET DE LA MISSION", ML + 2, cy);
      cy += 4;
      doc.setDrawColor(...NAVYL); doc.setLineWidth(0.4);
      doc.line(ML + 2, cy, PW - MR, cy);
      cy += 5;
      doc.setFont("helvetica","bold"); doc.setFontSize(14);
      doc.setTextColor(...NAVY);
      const missionLines = doc.splitTextToSize((pForm.missionTitle || "Mission").toUpperCase(), cw - 4);
      missionLines.forEach(l => { doc.text(l, ML + 2, cy); cy += 9; });
      cy += 3;

      // ── Blocs Parties (fond bleu très clair) ──
      const blockW = (cw - 6) / 2;

      // Prestataire
      doc.setFillColor(...NAVYLT); doc.rect(ML, cy, blockW, 56, "F");
      doc.setDrawColor(...NAVYL); doc.setLineWidth(0.3); doc.rect(ML, cy, blockW, 56);
      // En-tête bloc
      doc.setFillColor(...NAVY); doc.rect(ML, cy, blockW, 9, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text("PRESTATAIRE", ML + 4, cy + 6.5);
      // Contenu
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...NAVY);
      doc.text(pForm.freelanceName, ML + 4, cy + 17);
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
      const actLines = doc.splitTextToSize(pForm.freelanceActivity, blockW - 8);
      actLines.forEach((l,i) => doc.text(l, ML + 4, cy + 24 + i*5));
      let offAct = cy + 24 + actLines.length * 5 + 2;
      if (pForm.freelanceSiret) { doc.setTextColor(...GREY); doc.setFontSize(7.5); doc.text(`SIRET : ${pForm.freelanceSiret}`, ML + 4, offAct); offAct += 5; }
      doc.setFontSize(7.5); doc.setTextColor(...DARK);
      const addrLines1 = doc.splitTextToSize(pForm.freelanceAddress, blockW - 8);
      addrLines1.forEach((l,i) => doc.text(l, ML + 4, offAct + i*4.5));
      if (pForm.freelanceEmail) { doc.setTextColor(...NAVYL); doc.text(pForm.freelanceEmail, ML + 4, offAct + addrLines1.length*4.5 + 2); }

      // Client
      const cx2 = ML + blockW + 6;
      doc.setFillColor(...NAVYLT); doc.rect(cx2, cy, blockW, 56, "F");
      doc.setDrawColor(...NAVYL); doc.setLineWidth(0.3); doc.rect(cx2, cy, blockW, 56);
      doc.setFillColor(...NAVY); doc.rect(cx2, cy, blockW, 9, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text("CLIENT", cx2 + 4, cy + 6.5);
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...NAVY);
      doc.text(pForm.clientName, cx2 + 4, cy + 17);
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
      if (pForm.clientCompany) { doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text(pForm.clientCompany, cx2 + 4, cy + 24); }
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
      const addrLines2 = doc.splitTextToSize(pForm.clientAddress, blockW - 8);
      addrLines2.forEach((l,i) => doc.text(l, cx2 + 4, cy + (pForm.clientCompany ? 31 : 24) + i*4.5));
      if (pForm.clientEmail) { doc.setTextColor(...NAVYL); const emailOffY = cy + (pForm.clientCompany ? 31 : 24) + addrLines2.length*4.5 + 2; doc.text(pForm.clientEmail, cx2 + 4, emailOffY); }

      cy += 64;

      // ── Tableau récapitulatif des conditions (style premium) ──
      doc.setFont("helvetica","bold"); doc.setFontSize(7);
      doc.setTextColor(...NAVYL);
      doc.text("RÉCAPITULATIF DES CONDITIONS FINANCIÈRES ET OPÉRATIONNELLES", ML, cy);
      cy += 3;

      const acomptePctPdf = Number(pForm.acomptePourcentage) || 0;
      const tableRows = [
        ["Mission",          pForm.missionTitle],
        ["Période",          `Du ${d1} au ${d2}`],
        ["Honoraires HT",    `${Number(pForm.price).toLocaleString("fr-FR")} €`],
      ];
      if (acomptePctPdf > 0) {
        tableRows.push([`Acompte (${acomptePctPdf} %)`, `${Math.round(Number(pForm.price)*acomptePctPdf/100).toLocaleString("fr-FR")} € — dû à la signature`]);
        tableRows.push([`Solde (${100 - acomptePctPdf} %)`, `${Math.round(Number(pForm.price)*(100-acomptePctPdf)/100).toLocaleString("fr-FR")} € — dû à la livraison`]);
      }
      tableRows.push(["Délai de paiement", pForm.paymentTerms === "Comptant" ? "Comptant à la commande" : `${pForm.paymentTerms} jours nets`]);
      tableRows.push(["Révisions incluses", `${pForm.revisions} aller${pForm.revisions !== "1" ? "s" : ""}-retour${pForm.revisions !== "1" ? "s" : ""}`]);
      tableRows.push(["Pénalités de retard", pForm.latePaymentPenalty ? (pForm.typeClient === "particulier" ? "Oui — Taux d'intérêt légal (consommateur)" : "Oui — Taux BCE + 10 pts + 40 € forfait (art. L441-10 C.com.)") : "Non stipulées"]);


      // En-tête tableau bleu
      doc.setFillColor(...NAVY); doc.rect(ML, cy, cw, 8, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text("DÉSIGNATION", ML + 4, cy + 5.5);
      doc.text("DÉTAIL", ML + 60, cy + 5.5);
      cy += 8;

      tableRows.forEach((row, ri) => {
        const isTotal = row[0] === "Honoraires HT";
        const bg = isTotal ? NAVYLT : (ri % 2 === 0 ? [252,252,252] : WHITE);
        doc.setFillColor(...bg); doc.rect(ML, cy, cw, 8, "F");
        doc.setDrawColor(...GREYLT); doc.setLineWidth(0.15); doc.rect(ML, cy, cw, 8);
        // Séparateur colonne
        doc.setDrawColor(...GREYLT); doc.line(ML + 56, cy, ML + 56, cy + 8);
        // Label
        const labelColor = isTotal ? NAVY : [80,80,80];
        const labelWeight = isTotal ? "bold" : "bold";
        doc.setFont("helvetica", labelWeight); doc.setFontSize(isTotal ? 8 : 7.5);
        doc.setTextColor(...labelColor);
        doc.text(row[0], ML + 4, cy + 5.5);
        // Valeur
        const valColor = isTotal ? NAVY : DARK;
        doc.setFont("helvetica", isTotal ? "bold" : "normal"); doc.setFontSize(isTotal ? 8.5 : 7.5);
        doc.setTextColor(...valColor);
        const valLines = doc.splitTextToSize(String(row[1]), cw - 62);
        valLines.forEach((vl, vi) => {
          if (vi > 0) { cy += 5; doc.setFillColor(...bg); doc.rect(ML, cy, cw, 5, "F"); }
          doc.text(vl, ML + 60, cy + 5.5);
        });
        cy += 8;
      });

      // Ligne TOTAL grasse
      doc.setFillColor(...NAVY); doc.rect(ML, cy, cw, 10, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...WHITE);
      doc.text("TOTAL HT", ML + 4, cy + 7);
      doc.text(`${Number(pForm.price).toLocaleString("fr-FR")} €`, PW - MR, cy + 7, { align:"right" });
      cy += 14;

      // Note de bas de page de garde
      doc.setFont("helvetica","italic"); doc.setFontSize(6.8);
      doc.setTextColor(...GREY);
      doc.text("Les droits de propriété intellectuelle sont cédés sous condition suspensive du paiement intégral des honoraires.", ML, cy);
      cy += 5;
      doc.text("Contrat soumis au droit français. Généré par Freeley — IA. À faire relire pour toute mission sensible.", ML, cy);

      /* ══════════════════════════════════════════
         PAGES DE CONTENU DU CONTRAT
      ══════════════════════════════════════════ */
      doc.addPage();
      let y = BODY_TOP + 6;

      const newPage = () => {
        doc.addPage();
        y = BODY_TOP + 6;
      };

      const checkY = (need = 8) => {
        if (y + need > BODY_BOT) newPage();
      };

      // Détection clause pénalités (encadré ambre)
      const isPenaltyClause = (text) =>
        /40\s*€|pénalités?\s+de\s+retard|L441-10|L441-11|indemnité\s+forfaitaire|taux\s+directeur|banque\s+centrale/i.test(text);

      const isPIClause = (text) =>
        /cession.*subordonn|droits.*propriété.*intellectuelle.*paiement|contrefaçon|L335-2|L111-1|L122-1|L131-1/i.test(text);

      const isMoyensClause = (text) =>
        /obligation\s+de\s+moyens|responsabilité.*plafonnée|faute\s+prouvée|préjudice\s+indirect/i.test(text);

      // Parse contrat
      const paragraphs = pContract.split(/\n{2,}/);
      paragraphs.forEach(para => {
        if (!para.trim()) return;
        const lines = para.split("\n");

        // Détection de bloc spécial (encadré ambre)
        const fullPara = para.trim();
        const isLegalCallout = isPenaltyClause(fullPara) || isPIClause(fullPara) || isMoyensClause(fullPara);

        // Si c'est un bloc spécial, on wrappe tout le paragraphe dans l'encadré
        if (isLegalCallout && lines.length >= 2 && !(/^ARTICLE\s+\d+\s*[-–—]/i.test(fullPara.split("\n")[0]))) {
          const allText = lines.map(l => l.trim()).filter(Boolean).join(" ");
          const wrapped = doc.splitTextToSize(allText, cw - 14);
          const blockH = wrapped.length * 5 + 10;
          checkY(blockH + 4);
          y += 2;
          // Fond ambre
          doc.setFillColor(...AMBER); doc.rect(ML, y - 3, cw, blockH, "F");
          // Bordure gauche orange
          doc.setFillColor(...AMBER_BORDER); doc.rect(ML, y - 3, 3.5, blockH, "F");
          // Bordure extérieure légère
          doc.setDrawColor(...AMBER_BORDER); doc.setLineWidth(0.3); doc.rect(ML, y - 3, cw, blockH);
          // Icône ⚖ simulée (texte)
          doc.setFont("helvetica","bold"); doc.setFontSize(7);
          doc.setTextColor(...AMBER_BORDER);
          doc.text("CLAUSE CLÉE", ML + 6, y + 2);
          y += 6;
          doc.setFont("helvetica","normal"); doc.setFontSize(8.2); doc.setTextColor(100, 55, 0);
          wrapped.forEach(l => { doc.text(l, ML + 7, y); y += 5; });
          y += 6;
          return;
        }

        lines.forEach(line => {
          const t = line.trim();
          if (!t) { y += 2.5; return; }

          const isArticleTitle = /^ARTICLE\s+\d+\s*[-–—]/i.test(t);
          const isSubTitle = /^\d+\.\d+[\s\u00A0]/.test(t) || (/^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ\s·]{4,}[:.]/.test(t) && t.length < 90);

          if (isArticleTitle) {
            checkY(20);
            y += 5;
            // Barre bleue marine full-width avec texte blanc
            const artLines = doc.splitTextToSize(t.toUpperCase(), cw - 10);
            const barH = Math.max(11, artLines.length * 6 + 4);
            doc.setFillColor(...NAVY); doc.rect(ML, y - 6, cw, barH, "F");
            // Filet doré en bas
            doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
            doc.line(ML, y - 6 + barH, ML + cw, y - 6 + barH);
            doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...WHITE);
            artLines.forEach((l, i) => doc.text(l, ML + 5, y + i * 6));
            y += barH - 2;
          } else if (isSubTitle) {
            checkY(10);
            y += 3;
            // Sous-titre en bleu accent avec soulignement fin
            doc.setFont("helvetica","bold"); doc.setFontSize(8.5);
            doc.setTextColor(...NAVYL);
            doc.text(t, ML, y);
            doc.setDrawColor(...NAVYL); doc.setLineWidth(0.25);
            const tw = doc.getTextWidth(t);
            doc.line(ML, y + 1.2, ML + Math.min(tw, cw), y + 1.2);
            y += 7;
          } else {
            // Corps de texte
            const isBullet = /^[-•·▸–]/.test(t);
            const cleanT = t.replace(/^[-•·▸–]\s*/, "");
            const indent = isBullet ? ML + 6 : ML;
            const textWidth = isBullet ? cw - 6 : cw;

            if (isBullet) {
              checkY(6);
              doc.setFillColor(...NAVYL);
              doc.circle(ML + 2.5, y - 1.2, 1, "F");
            }
            doc.setFont("helvetica","normal"); doc.setFontSize(8.8);
            doc.setTextColor(...DARK);
            const wrapped = doc.splitTextToSize(cleanT, textWidth);
            wrapped.forEach(l => {
              checkY(5.5);
              doc.text(l, indent, y);
              y += 5.2;
            });
          }
        });
        y += 3;
      });

      /* ══════════════════════════════════════════
         BLOC SIGNATURES — STYLE NOTARIAL PREMIUM
      ══════════════════════════════════════════ */
      checkY(80);
      y += 8;

      // Barre titre SIGNATURES
      doc.setFillColor(...NAVY); doc.rect(ML, y - 5, cw, 11, "F");
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.6);
      doc.line(ML, y + 6, ML + cw, y + 6);
      doc.setFont("helvetica","bold"); doc.setFontSize(9);
      doc.setTextColor(...WHITE);
      doc.text("SIGNATURES — BON POUR ACCORD", ML + 5, y + 2.5);
      y += 16;

      doc.setFont("helvetica","normal"); doc.setFontSize(8.2);
      doc.setTextColor(...DARK);
      doc.text("Les soussignés déclarent avoir lu et approuvé l'intégralité des clauses du présent contrat.", ML, y);
      doc.text("Ils s'engagent à en respecter les termes et conditions. Parapher chaque page.", ML, y + 5.5);
      y += 14;

      const bw = (cw - 10) / 2;

      // ── Bloc Prestataire ──
      // Fond bleu très clair + bordure bleue
      doc.setFillColor(...NAVYLT); doc.rect(ML, y, bw, 58, "F");
      doc.setDrawColor(...NAVYL); doc.setLineWidth(0.5); doc.rect(ML, y, bw, 58);
      // En-tête bloc
      doc.setFillColor(...NAVY); doc.rect(ML, y, bw, 9, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text("LE PRESTATAIRE", ML + 4, y + 6.5);
      // Badge scellé vert (simulé)
      doc.setFillColor(...GREEN); doc.circle(ML + bw - 10, y + 4.5, 5.5, "F");
      doc.setDrawColor(255,255,255); doc.setLineWidth(0.8); doc.circle(ML + bw - 10, y + 4.5, 5.5);
      doc.setFont("helvetica","bold"); doc.setFontSize(6); doc.setTextColor(...WHITE);
      doc.text("✓", ML + bw - 10, y + 5.8, { align:"center" });
      // Infos
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...NAVY);
      doc.text(pForm.freelanceName, ML + 4, y + 17);
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...DARK);
      const actLinesS = doc.splitTextToSize(pForm.freelanceActivity, bw - 8);
      actLinesS.forEach((l,i) => doc.text(l, ML + 4, y + 23 + i*5));
      if (pForm.freelanceSiret) { doc.setTextColor(...GREY); doc.text(`SIRET : ${pForm.freelanceSiret}`, ML + 4, y + 30); }
      // Ligne signature
      doc.setDrawColor(...NAVY); doc.setLineWidth(0.6);
      doc.line(ML + 4, y + 50, ML + bw - 4, y + 50);
      doc.setFont("helvetica","normal"); doc.setFontSize(7);
      doc.setTextColor(...NAVYL);
      doc.text("Lu et approuvé — Signature et date :", ML + 4, y + 38);
      doc.setTextColor(...GREY); doc.setFontSize(6.5);
      doc.text("(Prénom, Nom, Date, Lieu)", ML + 4, y + 55.5);

      // ── Bloc Client ──
      const cx3 = ML + bw + 10;
      doc.setFillColor(252, 252, 250); doc.rect(cx3, y, bw, 58, "F");
      doc.setDrawColor(...GREYLT); doc.setLineWidth(0.5); doc.rect(cx3, y, bw, 58);
      // En-tête bloc client
      doc.setFillColor(...DARK); doc.rect(cx3, y, bw, 9, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text("LE CLIENT", cx3 + 4, y + 6.5);
      // Infos client
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...DARK);
      doc.text(pForm.clientName, cx3 + 4, y + 17);
      if (pForm.clientCompany) {
        doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...GREY);
        doc.text(pForm.clientCompany, cx3 + 4, y + 23);
      }
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...DARK);
      const addrSig = doc.splitTextToSize(pForm.clientAddress, bw - 8);
      addrSig.forEach((l,i) => doc.text(l, cx3 + 4, y + (pForm.clientCompany ? 30 : 24) + i*4.5));
      // Ligne signature
      doc.setDrawColor(...DARK); doc.setLineWidth(0.6);
      doc.line(cx3 + 4, y + 50, cx3 + bw - 4, y + 50);
      doc.setFont("helvetica","normal"); doc.setFontSize(7);
      doc.setTextColor(...DARK);
      doc.text("Lu et approuvé — Bon pour accord :", cx3 + 4, y + 38);
      doc.setTextColor(...GREY); doc.setFontSize(6.5);
      doc.text("(Prénom, Nom, Date, Lieu, Qualité)", cx3 + 4, y + 55.5);

      y += 68;

      // Mention finale
      doc.setFont("helvetica","italic"); doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(`Contrat en ${1} exemplaire originaux. Droit français applicable. Freeley — ${today}`, ML, y);

      /* ── Header/footer toutes les pages intérieures ── */
      const total = doc.internal.getNumberOfPages();
      for (let i = 2; i <= total; i++) {
        doc.setPage(i);
        drawHeader();
        drawFooter(i - 1, total - 1);
      }

      doc.save(`Contrat_${safe(pForm.missionTitle)}_${safe(pForm.clientName)}.pdf`);
    } catch(err) { console.error(err); alert("Erreur PDF : " + (err.message || "inconnue") + " — Utilise le bouton Copier en attendant."); }
    if (!overrideForm) setPdfLoad(false);
  };

  const downloadScanReportPDF = (findings, label) => {
    if (!findings || !findings.length) { alert("Aucun résultat à télécharger."); return; }
    if (!jsPDFReady || !window.jspdf) { alert("PDF en cours de chargement, réessaie."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = 210, ML = 22, MR = 22, cw = PW - ML - MR;
    const NAVY = [26, 54, 93], GOLD = [180, 140, 70], DARK = [44, 62, 80];
    const DANGER = [200, 60, 60], WARN = [200, 150, 40], OK = [39, 119, 63];
    const today = new Date().toLocaleDateString("fr-FR");
    let y = 20;

    doc.setFillColor(...NAVY); doc.rect(0, 0, PW, 32, "F");
    doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(0, 32, PW, 32);
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(255,255,255);
    doc.text("Rapport d'analyse de contrat", ML, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200,215,235);
    doc.text(`${label || "Analyse"} — généré le ${today} via Freeley`, ML, 24);

    y = 46;
    findings.forEach((f, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      const color = f.level === "danger" ? DANGER : f.level === "warning" ? WARN : OK;
      const lbl = f.level === "danger" ? "RISQUE" : f.level === "warning" ? "À NÉGOCIER" : "POSITIF";
      doc.setFillColor(...color); doc.roundedRect(ML, y, 28, 6, 1, 1, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255,255,255);
      doc.text(lbl, ML + 14, y + 4, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...DARK);
      doc.text(f.article || `Point ${i+1}`, ML + 32, y + 4.5);
      y += 10;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(80,80,80);
      const lines = doc.splitTextToSize(f.text || "", cw);
      doc.text(lines, ML, y);
      y += lines.length * 4.6 + 8;
    });

    doc.save(`Analyse_Contrat_Freeley_${Date.now()}.pdf`);
  };

  const contractsLeft = Math.max(0, FREE_LIMIT - contractsUsed);

  const handleAuthSuccess = async (user) => {
    setAuthUser(user);
    await loadUserData(user);
    setShowAuthModal(false);
    // Si on vient du scanner, rouvrir le scanner
    console.log("handleAuthSuccess called, from_scanner:", localStorage.getItem("freeley_from_scanner"));
    // Restaurer le formulaire en cours si sauvegardé (priorité sur scanner)
    const pendingForm2 = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form=")).split("=")[1]) : null);
    if (pendingForm2) {
      localStorage.removeItem("freeley_from_scanner");
      goToScreen("app");
      return;
    }
    if (localStorage.getItem("freeley_from_scanner") === "1") {
      localStorage.removeItem("freeley_from_scanner");
      goToScreen("history");
      return;
    }
    // Restaurer le formulaire en cours si sauvegardé
    const pendingForm = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_form=")).split("=")[1]) : null);
    const pendingStep = (document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step="))?.split("=")[1] ? decodeURIComponent(document.cookie.split("; ").find(r=>r.startsWith("freeley_pending_step=")).split("=")[1]) : null);
    if (pendingForm) {
      try {
        setForm(JSON.parse(pendingForm));
        setStep(Number(pendingStep) || 0);
      } catch(e) {}
      document.cookie = "freeley_pending_form=;path=/;max-age=0";
      document.cookie = "freeley_pending_step=;path=/;max-age=0";
      goToScreen("app");
      return;
    }
    if (screen === "profile-gate") {
      goToScreen("profile");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setPremium(false); setPlan(null);
    setContractsUsed(0); setHistory([]);
  };

  /* ── Attente session ── */
  // Forcer connexion au démarrage
  if (authReady && !authUser && !showAuthModal) {
    setTimeout(() => { setShowAuthModal(true); setAuthMode("login"); }, 100);
  }

  // Forcer connexion au démarrage
  if (authReady && !authUser && !showAuthModal) {
    setTimeout(() => { setShowAuthModal(true); setAuthMode("login"); }, 100);
  }

  if (!authReady) return (
    <Shell>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, border:`3px solid ${C.navy}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 16px" }} />
          <div style={{ fontFamily:T.body, fontSize:13, color:C.textL }}>Chargement…</div>
        </div>
      </div>
    </Shell>
  );

  const AuthModalEl = showAuthModal
    ? <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    : null;

  const liveAlerts = (() => {
    const readIds = getReadAlertIds();
    return buildAlertsFromHistory(history).map(a => ({ ...a, read: readIds.includes(a.id) }));
  })();

  const headerProps = {
    isPremium, premiumPlan, left: contractsLeft,
    historyCount: history.length,
    authUser,
    profile,
    alerts: liveAlerts,
    onAuthClick: () => { setAuthMode("login"); setShowAuthModal(true); },
    onSignOut: handleSignOut,
    onPricing: () => goToScreen("pricing"),
    onHome: () => { goToScreen("app"); setStep(0); setContract(""); setForm(initialForm); },
    onHistory: () => goToScreen("history"),
    onDashboard: () => goToScreen("dashboard"),
    onCGU: () => goToScreen("cgu"),
    onProfile: () => authUser ? goToScreen("profile") : setScreen("profile-gate"),
    onOpenRecouvrement: () => setShowRecouvrementModal(true),
    onOpenNda: () => setShowNdaModal(true),
    onAlertsChanged: () => setAlertsTick(t => t + 1),
    onOpenMission: (alert) => {
      const contractId = alert?.id ? alert.id.replace(/^(recouvre_|sign_)/, "") : null;
      const entry = contractId ? history.find(c => String(c.id) === String(contractId)) : null;
      if (entry) { setHistoryView(entry); goToScreen("history"); }
      else { goToScreen("history"); }
    },
  };

  /* ── PROFILE GATE (visiteur anonyme) ── */
  if (screen === "profile-gate") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      <ProfileGate
        onCreateAccount={() => {
          // Simule la création de compte et débloque le profil
          setAuthMode("signup");
          setShowAuthModal(true);
          // Après connexion, AuthModal appelle handleAuthSuccess qui set authUser
          // On redirige ensuite vers profile
        }}
        onBack={() => goToScreen("app")}
      />
    </Shell>
  );

  /* ── PROFILE ── */
  if (screen === "profile") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      <ProfilePage
        profile={profile}
        updateProfile={updateProfile}
        setProfile={setProfile}
        onBack={() => goToScreen("app")}
        authUser={authUser}
        premiumPlan={premiumPlan}
        isPremium={isPremium}
        onSignOut={handleSignOut}
        onGoHome={() => goToScreen("app")}
      />
    </Shell>
  );

  /* ── RESET PASSWORD ── */
  if (screen === "scan-results") {
    const scanList = (() => { try { return JSON.parse(localStorage.getItem("freeley_scan_list")||"[]"); } catch(e){return [];} })();
    const [selectedScan, setSelectedScanIdx] = [scanList[0], 0];
    return (<Shell><div style={{maxWidth:520,margin:"0 auto",padding:"20px"}}>
      <button onClick={()=>{ goToScreen("history"); }} style={{background:"none",border:"none",cursor:"pointer",color:"#1B2E4B",fontSize:13,marginBottom:16}}>← Retour à l'historique</button>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1B2E4B",marginBottom:8}}>Mes analyses de contrats</h2>
      <p style={{fontSize:13,color:"#8A8780",marginBottom:20}}>{scanList.length} analyse{scanList.length > 1 ? "s" : ""} sauvegardée{scanList.length > 1 ? "s" : ""}</p>
      {scanList.map((scan, idx) => {
        const findings = scan.aiFindings || [];
        const ext = scan.extractedData || {};
        const dangers = findings.filter(f=>f.level==="danger").length;
        const warnings = findings.filter(f=>f.level==="warning").length;
        return (
          <details key={idx} style={{marginBottom:12, border:"1.5px solid #D8D4CB", borderRadius:12, overflow:"hidden"}}>
            <summary style={{padding:"14px 16px", cursor:"pointer", fontFamily:"sans-serif", fontSize:14, fontWeight:600, color:"#1B2E4B", background:"#FAFAFA", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span>🔍 {ext.mission || "Analyse de contrat"} · {scan.date || ""}</span>
              <span style={{fontSize:12}}>{dangers > 0 ? `🔴 ${dangers}` : ""} {warnings > 0 ? `🟡 ${warnings}` : ""} {dangers === 0 && warnings === 0 ? "🟢" : ""}</span>
            </summary>
            <div style={{padding:"14px 16px"}}>
              {ext.client && <p style={{fontSize:12,color:"#8A8780",marginBottom:12}}>Client : {ext.client}</p>}
              {findings.map((f,i)=>(<div key={i} style={{background:f.level==="danger"?"#FEF2F2":f.level==="warning"?"#FFFBEB":"#F0FDF4",border:"1.5px solid "+(f.level==="danger"?"#FECACA":f.level==="warning"?"#FDE68A":"#BBF7D0"),borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontWeight:700,color:f.level==="danger"?"#DC2626":f.level==="warning"?"#D97706":"#16A34A",fontSize:11,marginBottom:3}}>{f.level==="danger"?"DANGER":f.level==="warning"?"A NEGOCIER":"CONFORME"}</div>
                <div style={{fontWeight:600,fontSize:13,color:"#1B2E4B",marginBottom:3}}>{f.article}</div>
                <div style={{fontSize:12,color:"#4A4A4A",lineHeight:1.6}}>{f.text}</div>
              </div>))}
              <div style={{display:"flex", gap:8, marginTop:8}}>
              <button onClick={()=>downloadScanReportPDF(findings, ext.mission || "Analyse de contrat")} style={{padding:"8px 14px", background:C.gold, border:"none", borderRadius:8, color:C.navyD, fontSize:12, fontWeight:700, cursor:"pointer"}}>
                ⬇ Télécharger PDF
              </button>
              <button onClick={()=>{
                const newList = scanList.filter((_,i)=>i!==idx);
                localStorage.setItem("freeley_scan_list", JSON.stringify(newList));
                if (newList.length === 0) { localStorage.removeItem("freeley_scan_results"); setHasScanResults(false); goToScreen("history"); }
                else { window.location.reload(); }
              }} style={{padding:"8px 14px", background:"none", border:"1px solid #FECACA", borderRadius:8, color:"#DC2626", fontSize:12, cursor:"pointer"}}>
                🗑 Supprimer cette analyse
              </button>
              </div>
            </div>
          </details>
        );
      })}
      {scanList.length === 0 && <p style={{color:"#8A8780",fontSize:13}}>Aucune analyse sauvegardée.</p>}
    </div></Shell>);
  }
  if (screen === "reset-password") return (
    <Shell>
      <div style={{ maxWidth:420, margin:"80px auto", padding:"0 20px" }}>
        <h2 style={{ fontFamily:"Georgia, serif", fontSize:24, color:"#1B2E4B", marginBottom:8 }}>Nouveau mot de passe</h2>
        <p style={{ fontSize:13, color:"#8A8780", marginBottom:24 }}>Choisis un nouveau mot de passe pour ton compte.</p>
        <ResetPasswordForm onSuccess={() => goToScreen("app")} />
      </div>
    </Shell>
  );

  /* ── HISTORY ── */
  if (screen === "dashboard") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      <DashboardPage
        history={history}
        onBack={() => goToScreen("app")}
        onNewContract={() => { goToScreen("app"); setStep(0); setContract(""); setForm(initialForm); }}
        onOpenHistory={() => goToScreen("history")}
      />
    </Shell>
  );

  if (screen === "cgu") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      <CGUPage onBack={() => goToScreen("app")} />
    </Shell>
  );

  if (screen === "history") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      {relanceToast && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:9999, pointerEvents:"none", animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg, #065F46 0%, #059669 100%)", color:"#fff", borderRadius:50, padding:"13px 26px", fontFamily:T.body, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px #05966940", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:16 }}>✉️</span>
            Relance sur-mesure envoyée avec succès à votre client !
          </div>
        </div>
      )}
      {relanceModal && (
        <RelanceModal
          msg={relanceMsg}
          setMsg={setRelanceMsg}
          onClose={() => setRelanceModal(false)}
          onSend={sendRelance}
        />
      )}
      <HistoryPage
        history={history}
        historyView={historyView}
        setHistoryView={setHistoryView}
        onBack={() => goToScreen("app")}
        onDownloadPDF={(entry) => downloadPDF(entry.form, entry.contract)}
        onDelete={async (id) => { await deleteFromHistory(id); const hist = await getHistory(); setHistory(hist); if (historyView?.id === id) setHistoryView(null); }}
        onDuplicate={async (entry) => {
          const dupForm = { ...(entry.form || {}), missionTitle: (entry.missionTitle || entry.form?.missionTitle || "") + " (copie)" };
          await saveToHistory({ contract: entry.contract || "" }, dupForm);
          const hist = await getHistory();
          setHistory(hist);
        }}
        jsPDFReady={jsPDFReady}
        isPremium={isPremium}
        onUpgrade={() => { goToScreen("pricing"); }}
        onRelance={openRelanceModal}
        onRateClient={openRatingModal}
      />
      {ratingModal && (
        <ClientRatingModal
          clientName={ratingModal.clientName}
          clientEmail={ratingModal.clientEmail}
          clientCompany={ratingModal.clientCompany}
          onClose={() => setRatingModal(null)}
          onSave={handleSaveRating}
        />
      )}
    </Shell>
  );

  /* ── PRICING ── */
  if (screen === "pricing") return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} />
      <PricingPage onSelect={handlePurchase} onBack={() => goToScreen("app")} />
    </Shell>
  );

  /* ── PAYWALL ── */
  if (showPaywall) return (
    <Shell>
      {AuthModalEl}
      <Header {...headerProps} onPricing={() => { setPaywall(false); goToScreen("pricing"); }} onHistory={() => { setPaywall(false); goToScreen("history"); }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 64px)", padding:24 }}>
        <div className="fade-up" style={{ maxWidth:500, width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"48px 40px", boxShadow:"0 24px 64px #1B2E4B0F" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ width:56, height:56, background:C.creamD, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:24 }}>🔒</div>
            <h2 style={{ fontFamily:T.display, fontSize:26, color:C.navy, fontWeight:600, marginBottom:10 }}>Limite gratuite atteinte</h2>
            <p style={{ fontFamily:T.body, color:C.textM, fontSize:14, lineHeight:1.7 }}>
              Tes <strong style={{color:C.navy}}>2 contrats gratuits</strong> ont été utilisés.<br/>Choisis la formule qui te convient.
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            <MiniPlanCard icon="📦" title="À l'unité" price="4€" sub="par contrat" color="#3B7DD8" onSelect={() => handlePurchase("unite")} />
            <MiniPlanCard icon="🌙" title="Mensuel" price="17€" sub="/mois · illimité" color={C.gold} recommended onSelect={() => handlePurchase("mensuel")} />
            <MiniPlanCard icon="☀️" title="Annuel" price="149€" sub="/an · ~12,40€/mois" color="#7C4DFF" onSelect={() => handlePurchase("annuel")} />
          </div>
          <button onClick={() => setPaywall(false)} style={{ display:"block", margin:"0 auto", background:"none", border:"none", color:C.textL, fontSize:12, cursor:"pointer", fontFamily:T.body, textDecoration:"underline" }}>
            ← Revenir en arrière
          </button>
        </div>
      </div>
    </Shell>
  );

  /* ── MAIN APP ── */
  return (
    <Shell>
      {AuthModalEl}

      {/* ── Centre d'aide ── */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* ── Bouton fixe Centre d'aide ── */}
      <button
        onClick={() => setShowHelp(true)}
        title="Centre d'aide"
        style={{
          position:"fixed", bottom:28, right:24,
          zIndex:9998,
          width:48, height:48,
          borderRadius:"50%",
          background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
          color:"#fff", border:"none",
          cursor:"pointer",
          fontSize:20,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 6px 24px ${C.navy}50`,
          transition:"all 0.2s",
        }}
        onMouseOver={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.08)"; e.currentTarget.style.boxShadow=`0 12px 32px ${C.navy}60`; }}
        onMouseOut={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow=`0 6px 24px ${C.navy}50`; }}
      >
        ❓
      </button>

      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handlePurchase}
        />
      )}
      {showInvoiceModal && (
        <InvoiceModal form={form} profile={profile} onClose={() => setShowInvoiceModal(false)} depositPctProp={invoiceDepositPct} onDepositPctChange={setInvoiceDepositPct} />
      )}
      {magicFillTarget && (
        <CameraCapture
          onCapture={handleMagicFillCapture}
          onClose={() => setMagicFillTarget(null)}
        />
      )}
      {showScannerModal && (
        <ScannerModal
          onClose={() => { setShowScannerModal(false); setScanResultsToShow(null); }}
          onRequestCamera={requestCameraPermission}
          initialResults={scanResultsToShow}
          authUser={authUser}
          onShowAuth={() => {
            setShowScannerModal(false);
            setAuthMode("signup");
            setShowAuthModal(true);
          }}
          onImportToDashboard={async (extractedData) => {
            setShowScannerModal(false);
            goToScreen("history");
          }}
        />
      )}
      {showTactileSign && (
        <TactileSignatureModal
          form={form}
          depositPct={invoiceDepositPct}
          onClose={() => setShowTactileSign(false)}
          onGoToProfile={() => { setShowTactileSign(false); goToScreen("profile"); }}
        />
      )}
      {showNdaModal && <NdaExpressModal onClose={() => setShowNdaModal(false)} />}
      {showRecouvrementModal && <RecouvrementFermeModal onClose={() => setShowRecouvrementModal(false)} />}

      {/* ── 📷 Popup permission caméra (simulation iOS/Android) ── */}
      {showCameraPermissionModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:10000,
          background:"rgba(0,0,0,0.45)", backdropFilter:"blur(5px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"12px",
        }}>
          <div style={{
            background:"#F2F2F7",
            borderRadius:14,
            width:"100%", maxWidth:290,
            boxShadow:"0 24px 64px rgba(0,0,0,0.35)",
            overflow:"hidden",
            animation:"cameraPopIn 0.32s cubic-bezier(.22,.68,0,1.2) both",
            fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
          }}>
            {/* Icon + Titre + Texte */}
            <div style={{ padding:"24px 20px 20px", textAlign:"center" }}>
              {/* Icône caméra façon iOS */}
              <div style={{
                width:56, height:56, borderRadius:14,
                background:"linear-gradient(145deg, #1C1C1E 0%, #2C2C2E 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 14px",
                boxShadow:"0 4px 14px rgba(0,0,0,0.22)",
              }}>
                <span style={{ fontSize:28 }}>📷</span>
              </div>
              <div style={{
                fontSize:17, fontWeight:600, color:"#1C1C1E",
                letterSpacing:"-0.02em", lineHeight:1.3, marginBottom:10,
              }}>
                « Freeley » souhaite accéder à l'appareil photo
              </div>
              <div style={{
                fontSize:13, color:"#48484A",
                lineHeight:1.55, letterSpacing:"-0.01em",
              }}>
                Cette autorisation permet à l'application de photographier vos cartes de visite, briefs de mission ou documents papiers afin d'extraire automatiquement les informations textuelles grâce à notre assistant.
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ height:1, background:"#C6C6C8" }} />

            {/* Boutons façon alerte iOS */}
            <div style={{ display:"flex" }}>
              <button
                onClick={() => {
                  setShowCameraPermissionModal(false);
                  setCameraPermission("denied");
                  setCameraPermissionDenied(true);
                  setTimeout(() => setCameraPermissionDenied(false), 4500);
                }}
                style={{
                  flex:1, padding:"14px 10px",
                  background:"transparent", border:"none",
                  borderRight:"1px solid #C6C6C8",
                  cursor:"pointer",
                  fontSize:17, fontWeight:400, color:"#007AFF",
                  fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
                  letterSpacing:"-0.01em", transition:"background 0.12s",
                }}
                onMouseOver={e=>e.currentTarget.style.background="#E5E5EA"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}
              >
                Refuser
              </button>
              <button
                onClick={() => {
                  setCameraPermission("granted");
                  setShowCameraPermissionModal(false);
                  if (cameraPermissionCallback) {
                    cameraPermissionCallback();
                    setCameraPermissionCallback(null);
                  }
                }}
                style={{
                  flex:1, padding:"14px 10px",
                  background:"transparent", border:"none",
                  cursor:"pointer",
                  fontSize:17, fontWeight:600, color:"#007AFF",
                  fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
                  letterSpacing:"-0.01em", transition:"background 0.12s",
                }}
                onMouseOver={e=>e.currentTarget.style.background="#E5E5EA"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}
              >
                Autoriser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Message discret si permission refusée ── */}
      {cameraPermissionDenied && (
        <div style={{
          position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, pointerEvents:"none",
          animation:"toastSlideIn 0.3s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            background:"rgba(44,44,46,0.92)", backdropFilter:"blur(10px)",
            color:"#F2F2F7", borderRadius:50,
            padding:"11px 20px",
            fontFamily:T.body, fontSize:12.5, fontWeight:500,
            boxShadow:"0 6px 24px rgba(0,0,0,0.28)",
            whiteSpace:"nowrap",
          }}>
            <span style={{ fontSize:14 }}>🚫</span>
            L'accès à l'appareil photo a été refusé. Vous pouvez toujours remplir les champs manuellement.
          </div>
        </div>
      )}
      <Header {...headerProps} />

      {/* ══ ⚡ VOS OUTILS IA INSTANTANÉS ══ */}
      <InstantToolsBar
        onNda={() => setShowNdaModal(true)}
        onRecouvrement={() => setShowRecouvrementModal(true)}
        onScanner={() => setShowScannerModal(true)}
        onInvoice={() => setShowInvoiceModal(true)}
        onProfile={() => authUser ? goToScreen("profile") : setScreen("profile-gate")}
      />

      {/* ── ⚡ Relance Toast ── */}
      {relanceToast && (
        <div style={{
          position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, pointerEvents:"none",
          animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"linear-gradient(135deg, #065F46 0%, #059669 100%)",
            color:"#fff", borderRadius:50,
            padding:"13px 26px",
            fontFamily:T.body, fontSize:13, fontWeight:600,
            boxShadow:"0 8px 32px #05966940",
            whiteSpace:"nowrap",
          }}>
            <span style={{ fontSize:16 }}>✉️</span>
            Relance sur-mesure envoyée avec succès à votre client !
          </div>
        </div>
      )}

      {/* ── Modale relance personnalisée ── */}
      {relanceModal && (
        <RelanceModal
          msg={relanceMsg}
          setMsg={setRelanceMsg}
          onClose={() => setRelanceModal(false)}
          onSend={sendRelance}
        />
      )}

      {loading ? (
        <ContractLivePreview
          form={form}
          phase={loadingPhase}
          apiReady={animDone && !!apiReadyRef.current}
          onAnimationDone={() => {
            if (apiReadyRef.current) doTransition.current(apiReadyRef.current);
          }}
        />

      ) : step < 3 ? (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 100px" }}>

          {/* Scan results banner */}
          {authUser && hasScanResults && (
            <div className="fade-up" style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"#EFF6FF", border:"1px solid #BFDBFE",
              borderRadius:8, padding:"10px 16px", marginBottom:16, fontFamily:T.body, fontSize:13,
            }}>
              <span style={{ color:"#1D4ED8" }}>🔍 Vous avez des résultats de scan en attente</span>
              <span onClick={() => goToScreen("scan-results")} style={{ fontSize:12, color:"#1D4ED8", cursor:"pointer", textDecoration:"underline", fontWeight:600 }}>
                Voir les résultats →
              </span>
            </div>
          )}

          {/* Status banner */}
          {!isPremium && (
            <div className="fade-up" style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background: contractsLeft === 0 ? "#FEF2F2" : contractsLeft === 1 ? "#FFFBEB" : "#F0FDF4",
              border:`1px solid ${contractsLeft === 0 ? "#FECACA" : contractsLeft === 1 ? "#FDE68A" : "#BBF7D0"}`,
              borderRadius:8, padding:"10px 16px", marginBottom:28, fontFamily:T.body, fontSize:13,
            }}>
              <span style={{ color: contractsLeft === 0 ? "#DC2626" : contractsLeft === 1 ? "#D97706" : "#16A34A" }}>
                {contractsLeft === 0 ? "Limite gratuite atteinte" : contractsLeft === 1 ? "Dernier contrat gratuit disponible" : `${contractsLeft} contrats gratuits restants`}
              </span>
              <span onClick={() => goToScreen("pricing")} style={{ fontSize:12, color:C.navy, cursor:"pointer", textDecoration:"underline", fontWeight:500 }}>
                Voir les tarifs →
              </span>
            </div>
          )}
          {isPremium && (
            <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:8, background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, padding:"10px 16px", marginBottom:28, fontFamily:T.body, fontSize:13, color:"#16A34A" }}>
              {premiumPlan==="unite" ? "📄 Contrat à l'unité activé" : premiumPlan==="mensuel" ? "⭐ Abonnement Mensuel · Contrats illimités" : "👑 Abonnement Annuel · Contrats illimités"}
            </div>
          )}

          {/* Stepper */}
          <div className="fade-up" style={{ display:"flex", alignItems:"center", marginBottom:48 }}>
            {STEPS.slice(0,3).map((s,i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%",
                    background: i < step ? C.navy : i === step ? C.navy : C.white,
                    border:`2px solid ${i <= step ? C.navy : C.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:"600", fontFamily:T.body,
                    color: i <= step ? C.white : C.textL,
                    transition:"all 0.3s",
                    boxShadow: i === step ? `0 0 0 4px #1B2E4B18` : "none",
                  }}>{i < step ? "✓" : i+1}</div>
                  <span style={{ fontSize:9, fontFamily:T.body, fontWeight:500, letterSpacing:"0.1em", color: i === step ? C.navy : C.textL, marginTop:6, whiteSpace:"nowrap" }}>
                    {s.toUpperCase()}
                  </span>
                </div>
                {i < 2 && <div style={{ flex:1, height:1.5, background: i < step ? C.navy : C.border, margin:"0 10px", marginBottom:16, transition:"background 0.3s" }} />}
              </div>
            ))}
          </div>

          {/* Step 0 */}
          {step === 0 && (
            <div>
              <MagicPhotoSectionTitle
                num="01"
                title="Tes informations"
                sub="En tant que prestataire de services"
                delay={1}
                onMagicFill={() => requestCameraPermission(magicFillStep0)}
                loading={scanStep0Loading}
                success={scanStep0Success}
                successMsg="Vos informations ont été extraites et injectées avec succès !"
                tooltipText="Gagnez du temps : prenez une photo de votre carte de visite ou de vos notes pour pré-remplir automatiquement les champs avec l'IA."
              />
              <Field label="Nom complet *" value={form.freelanceName} onChange={v=>update("freelanceName",v)} placeholder="Jean Dupont" error={errors.freelanceName} delay={2} />
              <Field label="Activité / Métier *" value={form.freelanceActivity} onChange={v=>update("freelanceActivity",v)} placeholder="Développeur web, Designer graphique…" error={errors.freelanceActivity} delay={3} />
              <Field label="Email professionnel *" value={form.freelanceEmail} onChange={v=>update("freelanceEmail",v)} placeholder="jean@example.com" type="email" error={errors.freelanceEmail} delay={4} />
              <Field label="Numéro SIRET" value={form.freelanceSiret} onChange={v=>update("freelanceSiret",v)} placeholder="123 456 789 00012 (optionnel)" delay={5} />
              <Field label="Adresse complète *" value={form.freelanceAddress} onChange={v=>update("freelanceAddress",v)} placeholder="12 rue de la Paix, 75001 Paris" error={errors.freelanceAddress} delay={5} />
              <SectionDivider label="Informations client" />
              <Field label="Nom du client *" value={form.clientName} onChange={v=>update("clientName",v)} placeholder="Marie Martin" error={errors.clientName} delay={2} />
              <Field label="Entreprise" value={form.clientCompany} onChange={v=>update("clientCompany",v)} placeholder="Startup SAS (optionnel)" delay={3} />
              <Field label="Email du client *" value={form.clientEmail} onChange={v=>update("clientEmail",v)} placeholder="marie@startup.com" type="email" error={errors.clientEmail} delay={4} />
              {/* Badge note client (système fantôme) */}
              {(() => {
                const rating = form.clientEmail ? getClientRating(form.clientEmail) : null;
                if (!rating) return null;
                const stars = "★".repeat(Math.round(rating.avg)) + "☆".repeat(5 - Math.round(rating.avg));
                return (
                  <div className="fade-up" style={{
                    display:"flex", alignItems:"center", gap:10,
                    background:"linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
                    border:"1.5px solid #FCD34D",
                    borderRadius:10, padding:"10px 14px", marginTop:-10, marginBottom:14,
                    animation:"fadeUp 0.3s ease both",
                  }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>⭐</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#92400E", marginBottom:2 }}>
                        Note moyenne de ce client : {rating.avg}/5
                        <span style={{ fontWeight:400, color:"#B45309", marginLeft:6, fontSize:11 }}>({rating.count} mission{rating.count > 1 ? "s" : ""})</span>
                      </div>
                      {rating.topBadges.length > 0 && (
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {rating.topBadges.map(b => (
                            <span key={b} style={{ fontFamily:T.body, fontSize:10, color:"#78350F", background:"#FDE68A", borderRadius:20, padding:"2px 8px", fontWeight:600 }}>{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <Field label="Adresse du client *" value={form.clientAddress} onChange={v=>update("clientAddress",v)} placeholder="5 avenue Victor Hugo, 69001 Lyon" error={errors.clientAddress} delay={4} />
              <ToggleGroup
                label="Type de client *"
                options={["professionnel","particulier"]}
                labels={["Une Entreprise / Pro (B2B)","Un Particulier (B2C)"]}
                value={form.typeClient}
                onChange={v=>update("typeClient",v)}
                tooltip="Détermine les clauses légales applicables : indemnité de recouvrement et taux BCE pour les professionnels, taux d'intérêt légal pour les particuliers."
              />
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <MagicPhotoSectionTitle
                num="02"
                title="La mission"
                sub="Décris précisément ce que tu vas livrer"
                delay={1}
                onMagicFill={() => requestCameraPermission(magicFillStep1)}
                loading={scanStep1Loading}
                success={scanStep1Success}
                successMsg="Les détails de la mission ont été extraits et configurés !"
                successStyle="gold"
                tooltipText="Gagnez du temps : prenez une photo de votre carte de visite ou de vos notes pour pré-remplir automatiquement les champs avec l'IA."
              />

              {/* Tip banner */}
              <div className="fade-up fade-up-1" style={{
                display:"flex", alignItems:"flex-start", gap:10,
                background:"#FFFBEB", border:"1px solid #FDE68A",
                borderRadius:8, padding:"12px 14px", marginBottom:24,
                fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.6,
              }}>
                <span style={{ fontSize:15, marginTop:1 }}>💡</span>
                <span><strong>Plus tu es précis, plus ton contrat sera protecteur.</strong> Mentionne les livrables exacts, le nombre de pages/écrans, les technologies, et ce qui n'est <em>pas</em> inclus dans la mission.</span>
              </div>

              <Field label="Titre de la mission *" value={form.missionTitle} onChange={v=>update("missionTitle",v)} placeholder="Création d'un site web e-commerce" error={errors.missionTitle} delay={2} />
              <DescriptionField value={form.missionDescription} onChange={v=>update("missionDescription",v)} error={errors.missionDescription} missionTitle={form.missionTitle} />
              <ToggleGroup
                label="Domaine d'activité *"
                options={["artisanat","digital","conseil","autre"]}
                labels={["🛠️ Métier Manuel / Artisanat","💻 Digital / Tech / Création","🧠 Conseil / Formation / Services","🔮 Autre / Général"]}
                value={form.categorieMetier}
                onChange={v=>update("categorieMetier",v)}
                tooltip="Adapte automatiquement les clauses du contrat : propriété intellectuelle pour le digital, garantie de conformité aux normes pour l'artisanat, confidentialité pour le conseil."
              />
              <div className="fade-up fade-up-4" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:16 }}>
                <Field label="Date de début *" value={form.startDate} onChange={v=>update("startDate",v)} type="date" error={errors.startDate} />
                <Field label="Date de fin *" value={form.endDate} onChange={v=>update("endDate",v)} type="date" error={errors.endDate} />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <SectionTitle num="03" title="Paiement & conditions" sub="Les termes financiers de ta mission" delay={1} />

              {/* Tip banner */}
              <div className="fade-up fade-up-1" style={{
                display:"flex", alignItems:"flex-start", gap:10,
                background:"#EFF6FF", border:"1px solid #BFDBFE",
                borderRadius:8, padding:"12px 14px", marginBottom:24,
                fontFamily:T.body, fontSize:12, color:"#1E40AF", lineHeight:1.6,
              }}>
                <span style={{ fontSize:15, marginTop:1 }}>ℹ️</span>
                <span><strong>Ces informations apparaîtront dans ton contrat.</strong> Le prix est ce que tu factures à ton client. Le délai de paiement est le temps qu'il a pour te payer après réception de ta facture.</span>
              </div>

              <Field label="Prix total HT (€) *" value={form.price} onChange={v=>update("price",v)} placeholder="800" type="number" error={errors.price} delay={2} prefix="€" />
              <div className="fade-up fade-up-3" style={{ marginBottom:4 }}>
                <ToggleGroup label="Acompte à la commande (optionnel)" options={["0","10","20","30","40","50"]} labels={["Aucun (0%)","10%","20%","30%","40%","50%"]} value={form.acomptePourcentage} onChange={v=>update("acomptePourcentage",v)} tooltip="Pourcentage payé par le client avant le début de la mission pour valider la commande." />
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, lineHeight:1.5, marginTop:-8, marginBottom:14 }}>
                  Pourcentage payé par le client avant le début de la mission pour valider la commande.
                </div>
              </div>
              <div className="fade-up fade-up-3">
                <ToggleGroup label="Délai de paiement" options={["Comptant","15","30","45","60"]} labels={["Comptant","15 jours","30 jours","45 jours","60 jours"]} value={form.paymentTerms} onChange={v=>update("paymentTerms",v)} tooltip="Comptant = paiement immédiat à la commande. Sinon, délai après réception de facture. 30 jours est le standard en France (max 60 jours)." />
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, lineHeight:1.5, marginTop:-8, marginBottom:14 }}>
                  Temps accordé au client pour régler le solde restant une fois la mission terminée et la facture reçue.
                </div>
              </div>
              <div className="fade-up fade-up-4">
                <ToggleGroup label="Révisions incluses" options={["1","2","3","Illimitées"]} labels={["1","2","3","Illimitées"]} value={form.revisions} onChange={v=>update("revisions",v)} tooltip="Nombre de retours client inclus dans le prix. Au-delà, tu peux facturer des modifications supplémentaires." />
              </div>

              {/* Pénalités de retard */}
              <div className="fade-up fade-up-5" style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                  <label style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:600 }}>PÉNALITÉS DE RETARD DE PAIEMENT</label>
                  <LegalTooltip text="Obligatoire en B2B (art. L441-10 C.com.). Taux = 3× le taux directeur BCE + 40€ d'indemnité forfaitaire. Protège le freelance en cas de retard de paiement." />
                </div>
                <div
                  onClick={() => update("latePaymentPenalty", !form.latePaymentPenalty)}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:14,
                    padding:"16px 18px",
                    background: form.latePaymentPenalty ? "#F0FDF4" : C.white,
                    border:`1.5px solid ${form.latePaymentPenalty ? "#86EFAC" : C.border}`,
                    borderRadius:10, cursor:"pointer",
                    transition:"all 0.2s",
                  }}
                >
                  {/* Toggle pill */}
                  <div style={{
                    width:42, height:24, borderRadius:12, flexShrink:0, marginTop:1,
                    background: form.latePaymentPenalty ? "#16A34A" : C.creamDD,
                    position:"relative", transition:"background 0.2s",
                  }}>
                    <div style={{
                      position:"absolute", top:3, left: form.latePaymentPenalty ? 21 : 3,
                      width:18, height:18, borderRadius:"50%", background:C.white,
                      boxShadow:"0 1px 4px #00000030",
                      transition:"left 0.2s",
                    }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color: form.latePaymentPenalty ? "#15803D" : C.textM, marginBottom:3 }}>
                      {form.latePaymentPenalty ? "✓ Clause activée — Contrat renforcé" : "Clause désactivée"}
                    </div>
                    <div style={{ fontFamily:T.body, fontSize:12, color: form.latePaymentPenalty ? "#16A34A" : C.textL, lineHeight:1.5 }}>
                      {form.latePaymentPenalty
                        ? (form.typeClient === "particulier"
                          ? "✓ Clause activée — Taux d'intérêt légal en vigueur applicable aux consommateurs"
                          : "Taux BCE + 10 pts · Indemnité 40€ · Art. L441-10 C.com. — Fortement recommandé")
                        : "Active cette clause pour protéger ton paiement en cas de retard client"}
                    </div>
                  </div>
                </div>
              </div>

              {apiError && (
                <div style={{ padding:"12px 16px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, color:C.error, fontSize:13, fontFamily:T.body, marginTop:8 }}>
                  {apiError}
                </div>
              )}

              {/* Auth gate reminder */}
              {!authUser && (
                <div className="fade-up fade-up-5" style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"#EFF6FF", border:"1px solid #BFDBFE",
                  borderRadius:8, padding:"12px 16px", marginTop:8,
                  fontFamily:T.body, fontSize:13,
                }}>
                  <span style={{ color:"#1E40AF" }}>🔐 Un compte est requis pour générer ton contrat</span>
                  <span onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }} style={{ fontSize:12, color:C.navy, cursor:"pointer", fontWeight:600, textDecoration:"underline", whiteSpace:"nowrap", marginLeft:12 }}>
                    Créer un compte gratuit →
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:44, gap:12 }}>
            {step > 0 ? (
              <button className="btn-secondary" onClick={() => { setStep(s=>s-1); setErrors({}); }} style={{
                padding:"12px 24px", background:"transparent", border:`1.5px solid ${C.border}`,
                color:C.textM, borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:T.body, fontWeight:500,
              }}>← Retour</button>
            ) : <div />}
            <button className="btn-primary" onClick={handleNext} disabled={loading} style={{
              padding:"14px 36px", background: loading ? C.creamDD : C.navy,
              color: loading ? C.textL : C.white,
              border:"none", borderRadius:8, cursor: loading ? "not-allowed" : "pointer",
              fontSize:14, fontFamily:T.body, fontWeight:600, letterSpacing:"0.04em",
              minWidth:200, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: loading ? "none" : "0 4px 16px #1B2E4B28",
            }}>
              {loading ? (
                <>
                  <span style={{ width:14, height:14, border:`2px solid ${C.textL}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>
                  Génération en cours…
                </>
              ) : step < 2 ? "Continuer →" : "✦ Générer mon contrat"}
            </button>
          </div>

        </div>

      ) : (
        /* ── CONTRACT RESULT ── */
        <div style={{ maxWidth:820, margin:"0 auto", padding:"24px 16px 80px" }}>

          {/* Yousign Modal */}
          {signModal && (
            <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" }}>
              <div className="fade-up" style={{ background:C.white, borderRadius:16, padding:"24px 16px", maxWidth:480, width:"100%", boxShadow:"0 24px 64px #00000030" }}>
                {!signResult ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                      <div style={{ width:44, height:44, background:"#EFF6FF", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>✍️</div>
                      <div>
                        <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, fontWeight:600 }}>Signature électronique</div>
                        <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginTop:2 }}>Via Yousign · RGPD · Valeur contractuelle</div>
                      </div>
                    </div>

                    {/* Recap signataires */}
                    <div style={{ background:C.creamD, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
                      <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:600, marginBottom:10 }}>SIGNATAIRES</div>
                      {[
                        { role:"Prestataire", name: form.freelanceName, email: form.freelanceEmail },
                        { role:"Client", name: form.clientName, email: form.clientEmail },
                      ].map(s => (
                        <div key={s.role} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <div style={{ width:28, height:28, background:C.navy, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:C.white, fontWeight:700, flexShrink:0 }}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy }}>{s.name}</div>
                            <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>{s.email} · {s.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:8, padding:"10px 14px", marginBottom:20, fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.6 }}>
                      ℹ️ Chaque signataire recevra un email avec son lien de signature personnel. Tu peux aussi leur partager le lien directement.
                    </div>

                    {signError && (
                      <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", marginBottom:16, fontFamily:T.body, fontSize:12, color:C.error }}>
                        ⚠ {signError}
                      </div>
                    )}

                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={() => { setSignModal(false); setSignError(""); }} style={{
                        flex:1, padding:"12px", background:C.creamD, border:`1px solid ${C.border}`,
                        borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM,
                      }}>Annuler</button>
                      <button onClick={sendForSignature} disabled={signLoading} style={{
                        flex:2, padding:"12px", background: signLoading ? C.creamDD : C.navy,
                        border:"none", borderRadius:8, cursor: signLoading ? "not-allowed" : "pointer",
                        fontSize:13, fontFamily:T.body, fontWeight:600, color: signLoading ? C.textL : C.white,
                        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      }}>
                        {signLoading ? (
                          <><span style={{ width:13, height:13, border:`2px solid ${C.textL}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Envoi en cours…</>
                        ) : "✍ Envoyer pour signature"}
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── Succès Yousign ── */
                  <>
                    <div style={{ textAlign:"center", marginBottom:24 }}>
                      <div style={{ width:56, height:56, background:"#F0FDF4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:26 }}>✅</div>
                      <div style={{ fontFamily:T.display, fontSize:22, color:C.navy, fontWeight:600, marginBottom:6 }}>Demande envoyée !</div>
                      <p style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.6 }}>
                        Les deux parties ont reçu un email. Tu peux aussi partager les liens ci-dessous.
                      </p>
                    </div>

                    {signResult.signerLinks.map((s, i) => (
                      <div key={i} style={{ background:C.creamD, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <div>
                            <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy }}>{s.name}</div>
                            <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>{s.email}</div>
                          </div>
                          <span style={{ fontFamily:T.body, fontSize:10, background:"#DBEAFE", color:"#1D4ED8", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>EN ATTENTE</span>
                        </div>
                        {s.link && (
                          <>
                            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                              <div style={{ flex:1, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontFamily:T.body, fontSize:11, color:C.textM, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {s.link}
                              </div>
                              <button onClick={() => {
                                navigator.clipboard.writeText(s.link);
                                setSignLinkCopied(s.email);
                                setTimeout(() => setSignLinkCopied(""), 2500);
                              }} style={{
                                padding:"7px 14px", background: signLinkCopied === s.email ? "#16A34A" : C.navy,
                                color:C.white, border:"none", borderRadius:6, cursor:"pointer",
                                fontSize:11, fontFamily:T.body, fontWeight:600, flexShrink:0, transition:"background 0.2s",
                              }}>{signLinkCopied === s.email ? "✓ Copié" : "Copier"}</button>
                            </div>
                            <button
                              onClick={() => {
                                const msg = `Bonjour ${s.name} ! Voici ton lien pour signer le contrat en ligne : ${s.link}`;
                                if (navigator.share) {
                                  navigator.share({ title:"Lien de signature", text: msg, url: s.link }).catch(() => {});
                                } else {
                                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                                }
                              }}
                              style={{
                                width:"100%", padding:"9px 14px",
                                background:"linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                                color:"#fff", border:"none", borderRadius:7, cursor:"pointer",
                                fontFamily:T.body, fontSize:12, fontWeight:700,
                                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                                boxShadow:"0 3px 10px #25D36630", transition:"all 0.18s",
                              }}
                              onMouseOver={e=>{ e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-1px)"; }}
                              onMouseOut={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}
                            >🔗 Envoyer le lien (WhatsApp / SMS)</button>
                          </>
                        )}
                      </div>
                    ))}

                    <button onClick={() => { setSignModal(false); }} style={{
                      width:"100%", marginTop:16, padding:"12px", background:C.creamD,
                      border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer",
                      fontSize:13, fontFamily:T.body, color:C.textM,
                    }}>Fermer</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Top bar */}
          <div className="fade-up" style={{
            background:C.navy, borderRadius:12, padding:"18px 16px",
            display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            marginBottom:24, flexWrap:"wrap", gap:12,
            boxShadow:"0 8px 32px #1B2E4B30",
          }}>
            <div>
              <div style={{ fontFamily:T.display, fontSize:18, color:C.white, marginBottom:4 }}>Contrat généré ✓</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:"#8BA3C0" }}>
                {form.missionTitle} · <span style={{color:C.goldL}}>{form.clientName}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", width:"100%" }}>
              <button onClick={() => setShowTactileSign(true)} style={{
                padding:"11px 16px",
                background:"linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color:C.white, border:"none", borderRadius:8, cursor:"pointer",
                fontSize:13, fontFamily:T.body, fontWeight:700, transition:"all .2s",
                boxShadow:"0 4px 14px #6366F140",
                display:"flex", alignItems:"center", gap:8,
                letterSpacing:"0.01em", width:"100%", justifyContent:"center",
              }}
                onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px #6366F160"; }}
                onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px #6366F140"; }}
              >✍️ Signer et envoyer au client</button>

              {/* ── Signature à distance ── */}
              {!remoteSignLink ? (
                <button
                  onClick={handleRemoteSign}
                  disabled={remoteSignLoading}
                  style={{
                    padding:"11px 16px",
                    background: remoteSignLoading ? "#2A4167" : "linear-gradient(135deg, #15803D 0%, #22C55E 100%)",
                    color: remoteSignLoading ? "#8BA3C0" : C.white, border:"none", borderRadius:8,
                    cursor: remoteSignLoading ? "wait" : "pointer",
                    fontSize:13, fontFamily:T.body, fontWeight:700,
                    display:"flex", alignItems:"center", gap:8,
                    width:"100%", justifyContent:"center",
                  }}
                >{remoteSignLoading ? "Création du lien…" : "📲 Envoyer au client pour signature à distance"}</button>
              ) : (
                <div style={{ width:"100%", background:"#0D2818", border:"1.5px solid #15803D", borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontFamily:T.body, fontSize:12.5, fontWeight:700, color:"#6EE7B7", marginBottom:8 }}>✓ Lien de signature prêt !</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:"#A7F3D0", lineHeight:1.5, marginBottom:12 }}>
                    Envoie ce lien à ton client (SMS, email, WhatsApp). Il pourra lire et signer le contrat depuis son téléphone. Tu seras notifié dans ton historique une fois signé.
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(remoteSignLink); setRemoteSignCopied(true); setTimeout(()=>setRemoteSignCopied(false), 2500); }}
                      style={{ flex:1, minWidth:120, padding:"10px", background: remoteSignCopied ? "#15803D" : "#134E2E", color:"#fff", border:"1px solid #15803D", borderRadius:8, cursor:"pointer", fontSize:12.5, fontWeight:600 }}
                    >{remoteSignCopied ? "✓ Copié !" : "📋 Copier le lien"}</button>
                    <a
                      href={`sms:?body=${encodeURIComponent("Bonjour, merci de signer le contrat via ce lien sécurisé : " + remoteSignLink)}`}
                      style={{ flex:1, minWidth:120, padding:"10px", background:"#134E2E", color:"#fff", border:"1px solid #15803D", borderRadius:8, textAlign:"center", fontSize:12.5, fontWeight:600, textDecoration:"none" }}
                    >💬 Envoyer par SMS</a>
                    <a
                      href={`mailto:${form.clientEmail || ""}?subject=${encodeURIComponent("Signature du contrat — " + (form.missionTitle||""))}&body=${encodeURIComponent("Bonjour,\n\nMerci de signer le contrat via ce lien sécurisé :\n" + remoteSignLink + "\n\nCordialement.")}`}
                      style={{ flex:1, minWidth:120, padding:"10px", background:"#134E2E", color:"#fff", border:"1px solid #15803D", borderRadius:8, textAlign:"center", fontSize:12.5, fontWeight:600, textDecoration:"none" }}
                    >✉️ Envoyer par email</a>
                  </div>
                </div>
              )}

              {/* ── Bouton lien de négociation ── */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4, width:"100%" }}>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?client=1`;
                    navigator.clipboard.writeText(url).then(() => {
                      setNegotLinkCopied(true);
                      setTimeout(() => setNegotLinkCopied(false), 3000);
                    });
                  }}
                  style={{
                    padding:"11px 22px",
                    background: negotLinkCopied
                      ? "linear-gradient(135deg, #065F46 0%, #059669 100%)"
                      : "transparent",
                    color: negotLinkCopied ? "#FFFFFF" : "#A5B4C8",
                    border: `1.5px solid ${negotLinkCopied ? "#059669" : "#354F6E"}`,
                    borderRadius:8, cursor:"pointer",
                    fontSize:14, fontFamily:T.body, fontWeight:600,
                    transition:"all .25s",
                    display:"flex", alignItems:"center", gap:8,
                    letterSpacing:"0.01em",
                    whiteSpace:"nowrap",
                  }}
                  onMouseOver={e => { if (!negotLinkCopied) { e.currentTarget.style.background="#1E3A56"; e.currentTarget.style.borderColor="#5A7A9A"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseOut={e => { if (!negotLinkCopied) { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#354F6E"; e.currentTarget.style.color="#A5B4C8"; } }}
                >
                  {negotLinkCopied ? "✓ Lien copié !" : "🔗 Copier le lien de relecture / négociation"}
                </button>
                <div style={{
                  fontFamily:T.body, fontSize:11, color:"#6A87A4",
                  fontStyle:"italic", lineHeight:1.55, paddingLeft:4,
                  maxWidth:460,
                }}>
                  Envoyez ce lien magique à votre client pour qu’il puisse relire le contrat et suggérer des modifications par article avant la signature finale.
                </div>
              </div>

              {/* ── Réviser le contrat avant signature ── */}
              <div style={{ width:"100%", background:"#122238", border:"1.5px solid #2A4167", borderRadius:12, padding:"16px 18px" }}>
                {!reviseOpen ? (
                  <button
                    onClick={() => setReviseOpen(true)}
                    style={{
                      width:"100%", padding:"12px 18px", background:"transparent",
                      color:"#C9A961", border:"1.5px solid #C9A961", borderRadius:8,
                      cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:600,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    }}
                  >🪄 Le client veut des modifications ? Réviser le contrat</button>
                ) : (
                  <div>
                    <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:"#E8EEF5", marginBottom:4 }}>Révision avant signature</div>
                    <div style={{ fontFamily:T.body, fontSize:11.5, color:"#8BA3C0", lineHeight:1.5, marginBottom:12 }}>
                      Colle ici le retour du client. L'IA modifiera directement le contrat (pas d'avenant, puisqu'il n'est pas encore signé).
                    </div>
                    <textarea
                      value={reviseMessage}
                      onChange={e => setReviseMessage(e.target.value)}
                      placeholder="Ex : Le client souhaite passer le délai de paiement à 45 jours et ajouter une révision supplémentaire."
                      rows={4}
                      style={{
                        width:"100%", padding:"12px 14px", borderRadius:8,
                        border:"1.5px solid #2A4167", background:"#0D1B2E", color:"#E8EEF5",
                        fontFamily:T.body, fontSize:13, lineHeight:1.6, resize:"vertical",
                        boxSizing:"border-box", outline:"none", marginBottom:12,
                      }}
                    />
                    {reviseError && <div style={{ fontFamily:T.body, fontSize:12, color:"#FCA5A5", marginBottom:10 }}>{reviseError}</div>}
                    {reviseSuccess && <div style={{ fontFamily:T.body, fontSize:12, color:"#6EE7B7", marginBottom:10, fontWeight:600 }}>✓ Contrat mis à jour ! Vérifie la nouvelle version ci-dessus.</div>}
                    <div style={{ display:"flex", gap:10 }}>
                      <button
                        onClick={() => { setReviseOpen(false); setReviseMessage(""); setReviseError(""); }}
                        disabled={reviseLoading}
                        style={{ flex:"0 0 auto", padding:"11px 16px", background:"transparent", color:"#8BA3C0", border:"1.5px solid #2A4167", borderRadius:8, cursor:"pointer", fontFamily:T.body, fontSize:13 }}
                      >Annuler</button>
                      <button
                        onClick={reviseContract}
                        disabled={reviseLoading}
                        style={{
                          flex:1, padding:"11px 18px",
                          background: reviseLoading ? "#2A4167" : "linear-gradient(135deg, #B8965A 0%, #C9A961 100%)",
                          color: reviseLoading ? "#8BA3C0" : "#0D1B2E", border:"none", borderRadius:8,
                          cursor: reviseLoading ? "wait" : "pointer",
                          fontFamily:T.body, fontSize:13, fontWeight:700,
                        }}
                      >{reviseLoading ? "L'IA révise le contrat…" : "✨ Appliquer les modifications"}</button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={downloadPDF} disabled={pdfLoading || !jsPDFReady} style={{
                padding:"10px 16px", background: (pdfLoading||!jsPDFReady) ? "#2A4167" : C.gold,
                color: (pdfLoading||!jsPDFReady) ? "#5A7A9A" : C.navyD,
                border:"none", borderRadius:7, cursor:(pdfLoading||!jsPDFReady)?"not-allowed":"pointer",
                fontSize:13, fontFamily:T.body, fontWeight:600, transition:"all .2s",
                flex:1, minWidth:0,
              }}>{pdfLoading ? "PDF…" : !jsPDFReady ? "Chargement…" : "⬇ Télécharger PDF"}</button>
              <button onClick={copyContract} style={{
                padding:"10px 16px",
                background: copied ? "#1E4A3A" : "#253D5E",
                color: copied ? "#6FCFA0" : "#8BA3C0",
                border:`1px solid ${copied ? "#2D6A4F" : "#354F6E"}`,
                borderRadius:7, cursor:"pointer", fontSize:13, fontFamily:T.body, transition:"all .2s",
                flex:1, minWidth:0,
              }}>{copied ? "✓ Copié" : "Copier"}</button>
              <button onClick={() => { setStep(0); setContract(""); setForm(initialForm); setErrors({}); setApiError(""); setSignResult(null); }} style={{
                padding:"10px 14px", background:"transparent", color:"#5A7A9A",
                border:"1px solid #354F6E", borderRadius:7, cursor:"pointer", fontSize:13, fontFamily:T.body,
                flexShrink:0,
              }}>↩</button>
            </div>
          </div>

          {/* ── AVENANT BUTTON ── */}
          <div className="fade-up fade-up-1" style={{ marginBottom:24 }}>
            <button
              onClick={() => setShowAvenantModal(true)}
              style={{
                width:"100%", padding:"16px 24px",
                background:"linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
                border:"1.5px solid #FCD34D",
                borderRadius:12, cursor:"pointer",
                display:"flex", alignItems:"center", gap:14,
                transition:"all 0.2s",
                boxShadow:"0 2px 8px #B8965A10",
              }}
              onMouseOver={e=>{ e.currentTarget.style.background="linear-gradient(135deg, #FEF9EE 0%, #FEF3C7 100%)"; e.currentTarget.style.boxShadow="0 6px 20px #B8965A20"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseOut={e=>{ e.currentTarget.style.background="linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)"; e.currentTarget.style.boxShadow="0 2px 8px #B8965A10"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <div style={{
                width:42, height:42, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, boxShadow:"0 4px 12px #F59E0B30",
              }}>➕</div>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:"#92400E", marginBottom:2 }}>
                  Créer un avenant
                  <span style={{
                    marginLeft:10, fontFamily:T.body, fontSize:10, fontWeight:700,
                    background:"#F59E0B", color:C.white,
                    padding:"2px 8px", borderRadius:20, letterSpacing:"0.05em",
                    verticalAlign:"middle",
                  }}>Ajout / Modification</span>
                </div>
                <div style={{ fontFamily:T.body, fontSize:12, color:"#B45309" }}>
                  Modifier le périmètre ou le prix sans refaire tout le contrat
                </div>
              </div>
              <span style={{ fontSize:18, color:"#F59E0B", fontWeight:700, flexShrink:0 }}>→</span>
            </button>

            {/* Info tooltip sous le bouton */}
            <div style={{
              display:"flex", alignItems:"flex-start", gap:8,
              marginTop:8, padding:"8px 14px",
              fontFamily:T.body, fontSize:11,
              color:C.textL, fontStyle:"italic",
              lineHeight:1.6,
            }}>
              <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>ℹ️</span>
              <span>
                Un avenant permet de modifier le prix ou d'ajouter des prestations en cours de mission sans refaire tout le contrat, tout en restant couvert contractuellement.
              </span>
            </div>
          </div>

          {/* Avenant Modal */}
          {showAvenantModal && (
            <AvenantModal
              form={form}
              contract={contract}
              avenantCount={avenantCount}
              onClose={() => setShowAvenantModal(false)}
              onCreated={() => setAvenantCount(n => n + 1)}
            />
          )}

          {/* Contract body — rendered Markdown */}
          <div className="fade-up fade-up-2">
            <MarkdownContract text={contract} form={form} />
          </div>

        </div>
      )}

      {/* ── Disclaimer global ── */}
      <div style={{
        padding:"10px 20px 16px",
        textAlign:"center",
      }}>
        <p style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:9,
          color:"#C4C0B8",
          lineHeight:1.55,
          margin:0,
          maxWidth:520,
          marginLeft:"auto",
          marginRight:"auto",
        }}>
          Freeley est un outil d'automatisation de documents commerciaux. L'application fournit des modèles basés sur vos données à des fins de gestion administrative et ne constitue pas un service de conseil ou de rédaction professionnelle.
        </p>
      </div>

    </Shell>
  );
}

/* ══════════════════════════════════════════ AVENANT MODAL ══ */
function AvenantModal({ form, contract, avenantCount, onClose, onCreated }) {
  const [objet, setObjet]             = useState("");
  const [ajustement, setAjustement]   = useState("");
  const [phase, setPhase]             = useState("form"); // "form" | "loading" | "result" | "signed"
  const [avenantText, setAvenantText] = useState("");
  const [error, setError]             = useState("");
  const [copied, setCopied]           = useState(false);
  const [avenantSigned, setAvenantSigned] = useState(false);
  const [signLoading, setSignLoading] = useState(false);

  // Extract contract number from the contract text
  const contractNumMatch = contract && contract.match(/CP-\d{4}-\d{3,5}/);
  const contractNum = contractNumMatch ? contractNumMatch[0] : "CP-" + new Date().getFullYear() + "-XXXX";
  const avenantNum = avenantCount + 1;

  const canGenerate = objet.trim().length >= 10;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setPhase("loading");
    setError("");
    try {
      const prompt = `Tu es un juriste français expert en droit des contrats de prestation de services. Rédige un AVENANT au contrat ci-dessous, court, précis et juridiquement valide.

CONTRAT DE RÉFÉRENCE : ${contractNum}
PARTIES : Prestataire ${form.freelanceName || "Prestataire"} / Client ${form.clientName || "Client"}${form.clientCompany ? " (" + form.clientCompany + ")" : ""}
MISSION : ${form.missionTitle || "Prestation de services"}

OBJET DE L'AVENANT : ${objet}
AJUSTEMENT FINANCIER : ${ajustement || "Aucun ajustement financier"}

CONSIGNES :
- Commence DIRECTEMENT par l'en-tête de l'avenant : "AVENANT N°${avenantNum} AU CONTRAT ${contractNum}"
- Indique la date du jour
- Rappelle les parties et le contrat de référence en une phrase
- Rédige une clause "ARTICLE 1 — OBJET DE L'AVENANT" décrivant la modification (3-5 phrases juridiques)
- Si ajustement financier : rédige "ARTICLE 2 — RÉVISION DES HONORAIRES" avec le nouveau montant ou la modification
- Rédige "ARTICLE 3 — ENTRÉE EN VIGUEUR" : cet avenant prend effet à compter de sa signature par les deux parties
- Rédige "ARTICLE 4 — DISPOSITIONS GÉNÉRALES" : les autres clauses du contrat principal restent inchangées
- Termine par un bloc SIGNATURES standard (Prestataire + Client)
- Maximum 300 mots, style juridique français rigoureux
- Ne laisse aucun champ vide`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = (data.content || []).map(i => i.text || "").join("").trim();
      if (!text) throw new Error("Réponse vide");
      setAvenantText(text);
      onCreated && onCreated();
      setPhase("result");
    } catch (err) {
      setError("Erreur lors de la génération. Vérifie ta connexion et réessaie.");
      setPhase("form");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(avenantText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSign = () => {
    setSignLoading(true);
    setTimeout(() => {
      setSignLoading(false);
      setAvenantSigned(true);
      setPhase("signed");
    }, 1600);
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0,
        background:"rgba(15,28,45,0.72)",
        backdropFilter:"blur(5px)",
        zIndex:9000,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"8px",
        overflowY:"auto",
      }}
    >
      <div className="fade-up" style={{
        background:C.white,
        borderRadius:20,
        width:"100%", maxWidth:520,
        boxShadow:"0 32px 80px rgba(0,0,0,0.35)",
        overflow:"hidden",
        margin:"auto",
      }}>

        {/* ── Header ── */}
        <div style={{
          background:"linear-gradient(135deg, #92400E 0%, #B45309 60%, #D97706 100%)",
          padding:"22px 24px 18px",
          position:"relative",
        }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:"rgba(251,191,36,0.15)", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{
              width:40, height:40, borderRadius:10, flexShrink:0,
              background:"rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20,
            }}>📝</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:18, color:C.white, fontWeight:700, lineHeight:1.2 }}>
                Créer un Avenant
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#FDE68A", marginTop:2 }}>
                Avenant n°{avenantNum} — {contractNum}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              position:"absolute", top:16, right:16,
              width:30, height:30, borderRadius:8,
              background:"rgba(255,255,255,0.15)", border:"none",
              color:"#FDE68A", fontSize:18, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}
          >×</button>
        </div>

        {/* ── PHASE FORM ── */}
        {phase === "form" && (
          <div style={{ padding:"24px" }}>
            <div style={{ marginBottom:20 }}>
              <label style={{
                display:"block", fontFamily:T.body, fontSize:10,
                letterSpacing:"0.14em", color:C.textL, fontWeight:700,
                marginBottom:8, textTransform:"uppercase",
              }}>OBJET DE LA MODIFICATION *</label>
              <textarea
                value={objet}
                onChange={e => setObjet(e.target.value)}
                rows={3}
                placeholder="Ex : Ajout de 2 pages web supplémentaires à la mission initiale, incluant leur intégration et mise en ligne..."
                style={{
                  width:"100%", padding:"12px 14px",
                  fontFamily:T.body, fontSize:13, color:C.text, lineHeight:1.65,
                  background:C.cream, border:`1.5px solid ${C.border}`,
                  borderRadius:10, resize:"vertical", outline:"none",
                  transition:"border-color 0.15s",
                  boxSizing:"border-box",
                }}
                onFocus={e => e.target.style.borderColor = C.navy}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:4 }}>
                Minimum 10 caractères • {objet.length} / min. 10
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{
                display:"block", fontFamily:T.body, fontSize:10,
                letterSpacing:"0.14em", color:C.textL, fontWeight:700,
                marginBottom:8, textTransform:"uppercase",
              }}>AJUSTEMENT DU PRIX</label>
              <input
                type="text"
                value={ajustement}
                onChange={e => setAjustement(e.target.value)}
                placeholder="Ex : + 500 € HT  ou  0 €  ou  Prolongation sans surcoût"
                style={{
                  width:"100%", padding:"12px 14px",
                  fontFamily:T.body, fontSize:13, color:C.text,
                  background:C.cream, border:`1.5px solid ${C.border}`,
                  borderRadius:10, outline:"none",
                  transition:"border-color 0.15s",
                  boxSizing:"border-box",
                }}
                onFocus={e => e.target.style.borderColor = C.navy}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:4 }}>
                Laisse vide si aucun changement de prix
              </div>
            </div>

            {/* Rappel contractuel */}
            <div style={{
              display:"flex", alignItems:"flex-start", gap:10,
              background:"#FFFBEB", border:"1px solid #FDE68A",
              borderRadius:10, padding:"12px 14px", marginBottom:20,
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>⚖️</span>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#92400E", lineHeight:1.6 }}>
                L'avenant est un document contractuel distinct qui modifie le contrat initial. Il doit être <strong>signé par les deux parties</strong> avant de démarrer les travaux supplémentaires.
              </div>
            </div>

            {error && (
              <div style={{ padding:"10px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontFamily:T.body, fontSize:12, color:C.error, marginBottom:14 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onClose} style={{
                flex:1, padding:"12px",
                background:C.white, border:`1.5px solid ${C.border}`,
                borderRadius:10, cursor:"pointer",
                fontFamily:T.body, fontSize:13, fontWeight:500, color:C.textM,
                transition:"all 0.15s",
              }}
                onMouseOver={e => e.currentTarget.style.background = C.creamD}
                onMouseOut={e => e.currentTarget.style.background = C.white}
              >Annuler</button>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                style={{
                  flex:2, padding:"12px",
                  background: canGenerate
                    ? "linear-gradient(135deg, #92400E 0%, #B45309 100%)"
                    : C.creamDD,
                  border:"none", borderRadius:10,
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  fontFamily:T.body, fontSize:14, fontWeight:700,
                  color: canGenerate ? C.white : C.textL,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow: canGenerate ? "0 4px 14px rgba(146,64,14,0.35)" : "none",
                  transition:"all 0.2s",
                }}
                onMouseOver={e => { if(canGenerate){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(146,64,14,0.4)"; }}}
                onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=canGenerate?"0 4px 14px rgba(146,64,14,0.35)":"none"; }}
              >
                <span style={{ fontSize:15 }}>✦</span>
                Générer l'avenant par IA
              </button>
            </div>
          </div>
        )}

        {/* ── PHASE LOADING ── */}
        {phase === "loading" && (
          <div style={{ padding:"48px 24px", textAlign:"center" }}>
            <div style={{
              width:64, height:64, borderRadius:16,
              background:"linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border:"2px solid #FCD34D",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, margin:"0 auto 24px",
              animation:"shimmer 1.2s ease-in-out infinite",
            }}>📝</div>
            <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, fontWeight:600, marginBottom:8 }}>
              Rédaction de l'avenant…
            </div>
            <div style={{ fontFamily:T.body, fontSize:13, color:"#B45309", marginBottom:28 }}>
              L'IA rédige votre document commercial
            </div>
            <div style={{ background:C.creamDD, borderRadius:8, height:6, overflow:"hidden", margin:"0 auto", maxWidth:280 }}>
              <div style={{
                height:"100%", borderRadius:8,
                background:"linear-gradient(90deg, #92400E, #F59E0B)",
                animation:"magicShimmer 1.4s linear infinite",
                backgroundSize:"200% 100%",
                width:"100%",
              }} />
            </div>
          </div>
        )}

        {/* ── PHASE RESULT ── */}
        {phase === "result" && (
          <div style={{ padding:"20px 24px 24px" }}>
            {/* Succès badge */}
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              background:"#F0FDF4", border:"1.5px solid #86EFAC",
              borderRadius:10, padding:"10px 14px", marginBottom:16,
              animation:"fadeUp 0.3s ease both",
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>✅</span>
              <div>
                <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:"#15803D", marginBottom:1 }}>Avenant n°{avenantNum} généré avec succès</div>
                <div style={{ fontFamily:T.body, fontSize:11, color:"#166534" }}>Document prêt à la signature</div>
              </div>
            </div>

            {/* Texte de l'avenant */}
            <div style={{
              background:C.cream, border:`1.5px solid ${C.border}`,
              borderRadius:10, padding:"16px",
              fontFamily:T.body, fontSize:12, color:C.text, lineHeight:1.75,
              maxHeight:280, overflowY:"auto",
              marginBottom:16, whiteSpace:"pre-wrap",
            }}>
              {avenantText}
            </div>

            {/* Actions : copier */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <button
                onClick={handleCopy}
                style={{
                  flex:1, padding:"10px",
                  background: copied ? "#F0FDF4" : C.white,
                  border:`1.5px solid ${copied ? "#86EFAC" : C.border}`,
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, fontWeight:600,
                  color: copied ? "#15803D" : C.textM,
                  transition:"all 0.2s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}
              >
                {copied ? <><span>✓</span> Copié !</> : <><span>📋</span> Copier le texte</>}
              </button>
            </div>

            {/* Signature Flash */}
            <div style={{
              background:"linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
              border:"1.5px solid #BFDBFE",
              borderRadius:12, padding:"16px 18px", marginBottom:14,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:18 }}>✍️</span>
                <div>
                  <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:"#1D4ED8" }}>Zone de Signature Flash</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:"#3B7DD8" }}>Protège-toi avant de démarrer les travaux supplémentaires</div>
                </div>
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#1D4ED8", lineHeight:1.6, marginBottom:12, background:"#DBEAFE", borderRadius:8, padding:"8px 12px" }}>
                📋 Envoie cet avenant à <strong>{form.clientName || "ton client"}</strong> pour signature avant de commencer le travail supplémentaire. Sa signature vaut engagement contractuel.
              </div>
              <button
                onClick={handleSign}
                disabled={signLoading}
                style={{
                  width:"100%", padding:"12px",
                  background: signLoading
                    ? C.creamDD
                    : "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                  border:"none", borderRadius:8, cursor: signLoading ? "not-allowed" : "pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:700,
                  color: signLoading ? C.textL : C.white,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow: signLoading ? "none" : "0 4px 14px #2563EB30",
                  transition:"all 0.2s",
                }}
                onMouseOver={e => { if(!signLoading){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px #2563EB40"; }}}
                onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=signLoading?"none":"0 4px 14px #2563EB30"; }}
              >
                {signLoading
                  ? <><span style={{ width:13, height:13, border:"2px solid #9CA3AF", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Envoi en cours…</>
                  : <><span style={{ fontSize:16 }}>🖊</span> Envoyer pour signature au client</>
                }
              </button>
            </div>

            <button onClick={onClose} style={{
              width:"100%", padding:"11px",
              background:C.creamD, border:`1px solid ${C.border}`,
              borderRadius:8, cursor:"pointer",
              fontFamily:T.body, fontSize:13, color:C.textM, fontWeight:500,
            }}>Fermer</button>
          </div>
        )}

        {/* ── PHASE SIGNED ── */}
        {phase === "signed" && (
          <div style={{ padding:"32px 24px", textAlign:"center" }}>
            <div style={{
              background:"linear-gradient(135deg, #052E16 0%, #14532D 100%)",
              borderRadius:16, padding:"20px 16px", marginBottom:20,
              position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:-16, right:-16, width:80, height:80, borderRadius:"50%", background:"rgba(34,197,94,0.12)" }} />
              <div style={{ fontSize:44, marginBottom:12 }}>🔒</div>
              <div style={{ fontFamily:T.display, fontSize:20, color:"#4ADE80", fontWeight:700, marginBottom:6 }}>
                Avenant n°{avenantNum} — Scellé !
              </div>
              <div style={{ fontFamily:T.body, fontSize:12, color:"#86EFAC", lineHeight:1.65 }}>
                Demande de signature envoyée à <strong style={{color:"#4ADE80"}}>{form.clientName || "votre client"}</strong>.<br/>
                Tu peux maintenant démarrer les travaux supplémentaires en toute sécurité.
              </div>
            </div>

            <div style={{
              background:"#F0FDF4", border:"1.5px solid #86EFAC",
              borderRadius:10, padding:"12px 16px", marginBottom:20,
              fontFamily:T.body, fontSize:12, color:"#166534", lineHeight:1.6, textAlign:"left",
            }}>
              🚀 <strong>Avenant activé !</strong> Avenant n°{avenantNum} lié au contrat {contractNum}. Ce document complète le contrat principal et engage les deux parties.
            </div>

            <button onClick={onClose} style={{
              width:"100%", padding:"13px",
              background:C.navy, color:C.white,
              border:"none", borderRadius:10, cursor:"pointer",
              fontFamily:T.body, fontSize:14, fontWeight:700,
              boxShadow:"0 4px 14px #1B2E4B28",
              transition:"all 0.2s",
            }}
              onMouseOver={e => { e.currentTarget.style.background="#152438"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseOut={e => { e.currentTarget.style.background=C.navy; e.currentTarget.style.transform="translateY(0)"; }}
            >✓ Fermer</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ MARKDOWN CONTRACT RENDERER ══ */
function MarkdownContract({ text, form }) {
  if (!text) return null;

  // ── Inline renderer: **bold** → <strong>
  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      /^\*\*[^*]+\*\*$/.test(part)
        ? <strong key={i} style={{ color: "#1a365d", fontWeight: 700 }}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  // ── Detect "pénalité de retard / 40€" block
  const isPenaltyLine = (line) =>
    /p[eé]nalit[eé]/i.test(line) || /40\s*[€e]/i.test(line) || /indemnit[eé]/i.test(line) || /retard/i.test(line);

  // ── Detect price table trigger line
  const isPriceLine = (line) =>
    /acompte|honoraire|montant total|rémunération|mission.*€|€.*mission/i.test(line) && /\d/.test(line);

  // ── Build price table from a content line
  const buildPriceTable = (line, idx) => {
    const clean = line.replace(/\*\*/g, "");
    // Try to extract label + amount pairs like "Acompte 30% : 500 €"
    const amountMatch = clean.match(/(\d[\d\s.,]*)\s*€/g) || [];
    const price = form?.price ? parseFloat(form.price) : null;

    const rows = [];
    if (price) {
      const acompte = form?.paymentTerms === "Acompte 30%" ? price * 0.3
        : form?.paymentTerms === "Acompte 50%" ? price * 0.5 : null;
      rows.push({ label: "Mission — " + (form?.missionTitle || "Prestation"), amount: price.toLocaleString("fr-FR") + " €" });
      if (acompte) rows.push({ label: "Acompte à la signature", amount: acompte.toLocaleString("fr-FR") + " €" });
      rows.push({ label: "Solde à la livraison", amount: (acompte ? price - acompte : price).toLocaleString("fr-FR") + " €" });
    } else {
      // Fallback: just render the line cleaned
      return null;
    }

    return (
      <div key={idx} style={{ margin: "18px 0 14px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a365d", color: "#fff" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, borderRadius: "6px 0 0 0", letterSpacing: "0.04em" }}>DÉSIGNATION</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 700, borderRadius: "0 6px 0 0", letterSpacing: "0.04em" }}>MONTANT HT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#F7F5F0" : "#fff", borderBottom: "1px solid #E8E4DB" }}>
                <td style={{ padding: "10px 16px", color: "#2D3748" }}>{r.label}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", color: "#1a365d", fontWeight: 700 }}>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Main line renderer
  const renderLine = (line, idx, allLines) => {
    const trimmed = line.trim();

    // H1: # TITLE
    if (/^# /.test(line)) {
      const title = line.replace(/^# /, "").replace(/\*\*/g, "").trim();
      return (
        <div key={idx} style={{ textAlign: "center", margin: "0 0 28px" }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#1a365d",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.3,
            marginBottom: 10,
          }}>{title}</div>
          <div style={{ width: 64, height: 3, background: "linear-gradient(90deg, #1a365d, #B8965A)", borderRadius: 2, margin: "0 auto 6px" }} />
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8A8780", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Document contractuel officiel
          </div>
        </div>
      );
    }

    // H2: ## section
    if (/^## /.test(line)) {
      return (
        <div key={idx} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: "#1a365d",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          marginTop: 28,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "2px solid #1a365d",
        }}>
          {line.replace(/^## /, "").replace(/\*\*/g, "")}
        </div>
      );
    }

    // H3: ### sub
    if (/^### /.test(line)) {
      return (
        <div key={idx} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: "#1a365d",
          marginTop: 16,
          marginBottom: 4,
        }}>
          {renderInline(line.replace(/^### /, ""))}
        </div>
      );
    }

    // ARTICLE headers (any form)
    if (/^(\*\*)?ARTICLE\s+\d+/i.test(trimmed)) {
      const clean = trimmed.replace(/\*\*/g, "").trim();
      return (
        <div key={idx} style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          margin: "28px 0 10px",
        }}>
          <div style={{ width: 4, borderRadius: "2px 0 0 2px", background: "linear-gradient(180deg, #1a365d 0%, #B8965A 100%)", flexShrink: 0 }} />
          <div style={{
            flex: 1,
            background: "linear-gradient(90deg, #EEF2FF 0%, transparent 100%)",
            padding: "10px 16px",
            borderTop: "1px solid #C7D2FE",
            borderBottom: "1px solid #C7D2FE",
            borderRight: "1px solid #C7D2FE",
            borderRadius: "0 6px 6px 0",
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: "#1a365d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>{clean}</span>
          </div>
        </div>
      );
    }

    // Penalty / late payment block
    if (isPenaltyLine(trimmed) && trimmed.length > 20) {
      return (
        <div key={idx} style={{
          display: "flex",
          gap: 0,
          margin: "10px 0",
        }}>
          <div style={{ width: 4, borderRadius: "2px 0 0 2px", background: "#F59E0B", flexShrink: 0 }} />
          <div style={{
            flex: 1,
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            padding: "10px 14px",
          }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ⚠ Clause pénalités de retard
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#78350F", lineHeight: 1.7 }}>
              {renderInline(trimmed.replace(/\*\*/g, ""))}
            </div>
          </div>
        </div>
      );
    }

    // Price table trigger
    if (isPriceLine(trimmed) && form?.price) {
      const table = buildPriceTable(trimmed, idx);
      if (table) return table;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      return <div key={idx} style={{ borderTop: "1px solid #E8E4DB", margin: "20px 0" }} />;
    }

    // Blank line
    if (trimmed === "") {
      return <div key={idx} style={{ height: 6 }} />;
    }

    // Normal paragraph
    return (
      <p key={idx} style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13.5,
        lineHeight: 1.95,
        color: "#2D3748",
        margin: "0 0 2px",
      }}>
        {renderInline(line.replace(/^[-•]\s*/, (m) => m ? "• " : ""))}
      </p>
    );
  };

  const lines = text.split("\n");
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const freelanceName = form?.freelanceName || "Prestataire";
  const clientName = form?.clientName || "Client";

  return (
    <div style={{
      background: C.white,
      borderRadius: 14,
      maxHeight: "70vh",
      overflowY: "auto",
      boxShadow: "0 20px 60px #1B2E4B1A, 0 4px 16px #1B2E4B0D, inset 0 1px 0 #ffffff",
      border: "1px solid #D8D4CB",
    }}>
      {/* Document header bar */}
      <div style={{
        background: "linear-gradient(135deg, #1a365d 0%, #2A4167 100%)",
        borderRadius: "14px 14px 0 0",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "rgba(255,255,255,0.12)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#fff", fontStyle: "italic" }}>C</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Freeley · Document officiel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E80" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Généré le {today}</span>
        </div>
      </div>

      {/* A4 page body */}
      <div style={{ padding: "32px 20px 36px" }}>
        {lines.map((line, idx) => renderLine(line, idx, lines))}

        {/* ── Signature block ── */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: "2px solid #E8E4DB" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "#8A8780", fontWeight: 700, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
            Signatures des parties
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>

            {/* Prestataire */}
            <div style={{
              border: "1.5px solid #BBF7D0",
              borderRadius: 10,
              padding: "20px 22px",
              background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Le prestataire</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#1a365d", marginBottom: 6 }}>{freelanceName}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#4B5563", marginBottom: 14, lineHeight: 1.5 }}>
                {form?.freelanceActivity || "Prestataire de services"}{form?.freelanceSiret ? <><br />SIRET : {form.freelanceSiret}</> : null}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 20, padding: "5px 12px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#15803D" }}>✓ Signé numériquement</span>
              </div>
            </div>

            {/* Client */}
            <div style={{
              border: "1.5px dashed #D1D5DB",
              borderRadius: 10,
              padding: "20px 22px",
              background: "#FAFAFA",
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Le client</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{clientName}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", marginBottom: 14, lineHeight: 1.5 }}>
                {form?.clientCompany || "Client"}{form?.clientEmail ? <><br />{form.clientEmail}</> : null}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 20, padding: "5px 12px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", animation: "shimmer 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#B45309" }}>En attente de signature…</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#B8B5AE", letterSpacing: "0.08em" }}>
            Document généré par Freeley · IA · À titre indicatif — faire relire par un professionnel pour les missions importantes
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#C8C4BC", marginTop: 8, lineHeight: 1.5, maxWidth: 520, margin: "8px auto 0" }}>
            Freeley est un outil d'automatisation de documents commerciaux. L'application fournit des modèles basés sur vos données à des fins de gestion administrative et ne constitue pas un service de conseil ou de rédaction professionnelle.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ LEGAL TOOLTIP ══ */
function LegalTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <span
        onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}
        style={{
          width:15, height:15, borderRadius:"50%",
          background:"#DBEAFE", border:"1px solid #93C5FD",
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          fontSize:9, color:"#1D4ED8", cursor:"help", fontFamily:T.body, fontWeight:700,
        }}>⚖</span>
      {show && (
        <div style={{
          position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
          background:C.navy, color:C.white, fontSize:11, fontFamily:T.body, lineHeight:1.6,
          padding:"10px 14px", borderRadius:8, width:260, zIndex:50,
          boxShadow:"0 8px 24px #00000040",
        }}>
          {text}
          <div style={{ position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%)", width:8, height:8, background:C.navy, rotate:"45deg" }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ LIVE PREVIEW ══ */
function ContractLivePreview({ form, phase, onAnimationDone, apiReady }) {
  const { useState: _useState, useEffect: _useEffect, useRef: _useRef } = { useState, useEffect, useRef };
  const [visibleArticles, setVisibleArticles] = _useState(0);
  const [dotCount, setDotCount] = _useState(1);
  const cascadeDoneRef = _useRef(false); // cascade visuelle terminée

  const articles = [
    "ARTICLE 1 — OBJET DU CONTRAT",
    "ARTICLE 2 — DESCRIPTION DE LA MISSION ET LIVRABLES",
    "ARTICLE 3 — DÉLAIS ET PLANNING",
    "ARTICLE 4 — RÉMUNÉRATION ET MODALITÉS DE PAIEMENT",
    "ARTICLE 5 — RÉVISIONS ET MODIFICATIONS",
    "ARTICLE 6 — PROPRIÉTÉ INTELLECTUELLE",
    "ARTICLE 7 — CONFIDENTIALITÉ",
    "ARTICLE 8 — RESPONSABILITÉS ET GARANTIES",
    "ARTICLE 9 — RÉSILIATION",
    "ARTICLE 10 — DROIT APPLICABLE ET LITIGES",
    "ARTICLE 11 — SIGNATURES",
  ];

  const phases = [
    { label: "Analyse de ta mission…", icon: "🔍" },
    { label: "Rédaction des clauses commerciales…", icon: "✍️" },
    { label: "Finalisation et vérification…", icon: "✅" },
  ];
  const currentPhase = phases[Math.max(0, phase - 1)] || phases[0];

  _useEffect(() => {
    // Cascade sur 1.5s : articles 1→10 au vert, article 11 en spinner
    const interval = setInterval(() => {
      setVisibleArticles(v => {
        const next = v + 1;
        if (next >= articles.length) {
          clearInterval(interval);
          cascadeDoneRef.current = true;
          // Cas : API déjà prête avant la fin de cascade → passer l'article 11 au vert et transiter
          if (apiReady) {
            setTimeout(() => {
              setVisibleArticles(vv => vv + 1);
              setTimeout(() => { if (onAnimationDone) onAnimationDone(); }, 500);
            }, 0);
          }
          return next;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Cas : cascade déjà finie quand l'API répond → passer l'article 11 au vert et transiter
  _useEffect(() => {
    if (!apiReady || !cascadeDoneRef.current) return;
    setVisibleArticles(v => v + 1);
    setTimeout(() => { if (onAnimationDone) onAnimationDone(); }, 500);
  }, [apiReady]);

  _useEffect(() => {
    const t = setInterval(() => setDotCount(d => d === 3 ? 1 : d + 1), 500);
    return () => clearInterval(t);
  }, []);

  const d1 = form.startDate ? new Date(form.startDate).toLocaleDateString("fr-FR") : "—";
  const d2 = form.endDate   ? new Date(form.endDate).toLocaleDateString("fr-FR")   : "—";
  const dots = ".".repeat(dotCount);

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"24px 16px 80px" }}>

      {/* Status bar */}
      <div className="fade-up" style={{
        background:C.navy, borderRadius:12, padding:"20px 28px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:24, flexWrap:"wrap", gap:12,
        boxShadow:"0 8px 32px #1B2E4B30",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:"#253D5E",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            animation:"shimmer 1.4s ease-in-out infinite",
          }}>{currentPhase.icon}</div>
          <div>
            <div style={{ fontFamily:T.display, fontSize:18, color:C.white, marginBottom:3 }}>
              {currentPhase.label.replace("…", dots)}
            </div>
            <div style={{ fontFamily:T.body, fontSize:12, color:"#8BA3C0" }}>
              {form.missionTitle} · <span style={{color:C.goldL}}>{form.clientName || "—"}</span>
            </div>
          </div>
        </div>
        {/* Phase pills */}
        <div style={{ display:"flex", gap:6 }}>
          {phases.map((p, i) => (
            <div key={i} style={{
              width:28, height:6, borderRadius:3,
              background: i < phase ? C.gold : i === phase - 1 ? C.goldL : "#354F6E",
              transition:"background 0.4s",
              animation: i === phase - 1 ? "shimmer 1s ease-in-out infinite" : "none",
            }}/>
          ))}
        </div>
      </div>

      {/* Preview document */}
      <div className="fade-up fade-up-2" style={{
        background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
        overflow:"hidden", boxShadow:"0 4px 24px #1B2E4B08",
      }}>
        {/* Doc header */}
        <div style={{
          background:C.navy, padding:"28px 40px 24px",
          borderBottom:`3px solid ${C.gold}`,
        }}>
          <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.2em", color:"#5A7A9A", marginBottom:10 }}>CONTRAT DE PRESTATION DE SERVICES</div>
          <div style={{ fontFamily:T.display, fontSize:22, color:C.white, fontWeight:600, marginBottom:16 }}>
            {form.missionTitle || "Mission freelance"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16 }}>
            {/* Prestataire */}
            <div style={{ background:"#253D5E", borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:"#5A7A9A", marginBottom:6 }}>PRESTATAIRE</div>
              <div style={{ fontFamily:T.body, fontSize:13, color:C.white, fontWeight:600 }}>{form.freelanceName || "—"}</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#8BA3C0", marginTop:2 }}>{form.freelanceActivity || "—"}</div>
            </div>
            {/* Client */}
            <div style={{ background:"#253D5E", borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:"#5A7A9A", marginBottom:6 }}>CLIENT</div>
              <div style={{ fontFamily:T.body, fontSize:13, color:C.white, fontWeight:600 }}>{form.clientName || "—"}</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#8BA3C0", marginTop:2 }}>{form.clientCompany || "—"}</div>
            </div>
          </div>
        </div>

        {/* Recap strip */}
        <div style={{
          background:C.creamD, padding:"14px 40px",
          display:"flex", gap:28, flexWrap:"wrap",
          borderBottom:`1px solid ${C.border}`,
        }}>
          {[
            ["Montant", form.price ? `${Number(form.price).toLocaleString("fr-FR")} € HT` : "—"],
            ["Période", `${d1} → ${d2}`],
            ["Paiement", form.paymentTerms === "Comptant" ? "Comptant" : `${form.paymentTerms}j`],
            ["Révisions", form.revisions],
            ["Pénalités", form.latePaymentPenalty ? "✓ BCE+10pts" : "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.1em", color:C.textL, fontWeight:600 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.navy, fontWeight:600, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Articles list */}
        <div style={{ padding:"24px 40px 32px" }}>
          <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.15em", color:C.textL, fontWeight:600, marginBottom:16 }}>STRUCTURE DU CONTRAT</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {articles.map((art, i) => {
              const visible = i < visibleArticles;
              // actif = en cours de rédaction (spinner) : dernier article visible tant que apiReady est false
              const active  = i === visibleArticles - 1;
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"10px 14px",
                  background: active ? "#F0FDF4" : visible ? C.creamD : C.creamD,
                  border:`1px solid ${active ? "#86EFAC" : visible ? C.borderL : C.borderL}`,
                  borderRadius:7,
                  opacity: visible ? 1 : 0.25,
                  transform: visible ? "translateX(0)" : "translateX(-8px)",
                  transition:"all 0.35s cubic-bezier(.22,.68,0,1.2)",
                }}>
                  <div style={{
                    width:20, height:20, borderRadius:"50%", flexShrink:0,
                    background: active ? "#16A34A" : visible ? C.navy : C.creamDD,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, color:C.white, fontWeight:700,
                  }}>
                    {active ? (
                      <span style={{ width:8, height:8, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.6s linear infinite" }}/>
                    ) : visible ? "✓" : i + 1}
                  </div>
                  <span style={{ fontFamily:T.body, fontSize:12, fontWeight:600, color: active ? "#15803D" : visible ? C.navy : C.textL, letterSpacing:"0.02em" }}>
                    {art}
                  </span>
                  {active && (
                    <span style={{ fontFamily:T.body, fontSize:10, color:"#16A34A", marginLeft:"auto", animation:"shimmer 1s ease-in-out infinite" }}>
                      Rédaction{dots}
                    </span>
                  )}
                  {visible && !active && (
                    <span style={{ fontFamily:T.body, fontSize:10, color:C.success, marginLeft:"auto" }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p style={{ color:C.textL, fontSize:11, marginTop:14, textAlign:"center", fontFamily:T.body }}>
        ⚡ Génération en cours — cela peut prendre environ 15 secondes…
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════ PRICING PAGE ══ */
function PricingPage({ onSelect, onBack }) {
  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"56px 24px 96px" }}>
      <div className="fade-up" style={{ textAlign:"center", marginBottom:56 }}>
        <div style={{ fontFamily:T.body, fontSize:11, letterSpacing:"0.2em", color:C.gold, fontWeight:600, marginBottom:12 }}>TARIFS</div>
        <h1 style={{ fontFamily:T.display, fontSize:38, color:C.navy, fontWeight:600, marginBottom:12, lineHeight:1.2 }}>
          Choisissez votre formule
        </h1>
        <p style={{ fontFamily:T.body, color:C.textM, fontSize:15 }}>
          Commencez gratuitement — passez premium quand vous êtes prêt
        </p>
      </div>

      <div className="fade-up fade-up-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16, marginBottom:48 }}>
        {/* Free */}
        <PricingCard icon="✦" title="Gratuit" price="0€" sub="pour toujours"
          features={["2 contrats d'essai","PDF inclus","Toutes les clauses"]}
          color={C.textL} cta={null} />
        {/* Unité */}
        <PricingCard icon="📦" title="À l'unité" price="4€" sub="par contrat"
          features={["1 contrat complet","Scan IA + Extraction","Téléchargement PDF","Idéal 1-2 missions/an"]}
          color="#3B7DD8" cta="Choisir" onSelect={() => onSelect("unite")} />
        {/* Mensuel — highlighted */}
        <PricingCard icon="🌙" title="Mensuel" price="17€" sub="/ mois · sans engagement"
          features={["Scans & contrats illimités","Négociations illimitées","Factures illimitées","Support prioritaire"]}
          color={C.gold} cta="S'abonner" recommended onSelect={() => onSelect("mensuel")} />
        {/* Annuel */}
        <PricingCard icon="☀️" title="Annuel" price="149€" sub="/ an · ~12,40€/mois"
          features={["Tout illimité","Économisez 4 mois de forfait","PDF illimités","Historique illimité"]}
          color="#7C4DFF" cta="Choisir" badge="MEILLEURE VALEUR" onSelect={() => onSelect("annuel")} />
      </div>

      {/* Comparison */}
      <div className="fade-up fade-up-3" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:28, marginBottom:32, boxShadow:"0 2px 12px #1B2E4B06" }}>
        <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.15em", color:C.textL, fontWeight:600, marginBottom:20 }}>COMPARAISON DES FORMULES</div>
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
        <table style={{ width:"100%", minWidth:400, borderCollapse:"collapse", fontFamily:T.body, fontSize:13 }}>
          <thead>
            <tr>
              {["Fonctionnalité","Gratuit","Unité","Mensuel","Annuel"].map((h,i)=>(
                <th key={h} style={{ padding:"8px 12px", textAlign:i===0?"left":"center", color:i===0?C.textL:C.navy, fontWeight:600, fontSize:i===0?11:12, borderBottom:`2px solid ${C.creamDD}`, letterSpacing:i===0?"0.1em":"0" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Contrats","2","1","Illimités","Illimités"],
              ["Téléchargement PDF","✓","✓","✓","✓"],
              ["Clauses complètes","✓","✓","✓","✓"],
              ["Historique","2 contrats","1 contrat","Illimité","Illimité"],
              ["Support prioritaire","—","—","✓","✓"],
              ["Prix","0€","4€/contrat","17€/mois","149€/an"],
            ].map((row,ri)=>(
              <tr key={ri}>
                {row.map((cell,ci)=>(
                  <td key={ci} style={{
                    padding:"10px 12px", textAlign:ci===0?"left":"center",
                    color: ci===0 ? C.textM : cell==="✓" ? C.success : cell==="—" ? C.creamDD : C.text,
                    fontSize:13, borderBottom:`1px solid ${C.borderL}`,
                    fontWeight: ri===4 ? 600 : 400,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div style={{ textAlign:"center" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.textL, fontSize:13, cursor:"pointer", fontFamily:T.body, textDecoration:"underline" }}>
          ← Retour à l'outil
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ EN COURS ACTIONS BAR ══ */
// Extrait de l'IIFE illégale pour respecter les règles des Hooks React (fix erreur #310)
function EnCoursActionsBar({ c }) {
  const [invoiceDropdown, setInvoiceDropdown] = useState(false);
  const [invoiceToast, setInvoiceToast] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!invoiceDropdown) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setInvoiceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [invoiceDropdown]);

  const rawPrice = c.price ? parseInt(c.price.replace(/[^0-9]/g, ""), 10) : 0;
  const depositAmt = Math.round(rawPrice * 0.30);

  const handleInvoiceAction = (type) => {
    setInvoiceDropdown(false);
    if (type === "acompte") {
      setInvoiceToast(`✅ Facture d'acompte de ${depositAmt.toLocaleString("fr-FR")} € générée !`);
    } else {
      setInvoiceToast("✅ Facture de solde finale générée !");
    }
    setTimeout(() => setInvoiceToast(null), 3200);
  };

  return (
    <div style={{ display:"flex", gap:8, position:"relative" }}>
      {/* Bouton PDF */}
      <button style={{
        display:"flex", alignItems:"center", gap:8,
        background:"none", border:`1px solid ${C.border}`,
        borderRadius:8, padding:"8px 14px", cursor:"pointer",
        fontFamily:T.body, fontSize:11, color:C.navy, fontWeight:600,
        transition:"all .18s", flexShrink:0,
      }}
        onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
        onMouseOut={e=>{ e.currentTarget.style.background="none"; }}
      >⬇ Télécharger le PDF</button>

      {/* Bouton Créer la facture */}
      <div ref={dropRef} style={{ position:"relative" }}>
        <button
          onClick={() => setInvoiceDropdown(v => !v)}
          style={{
            display:"flex", alignItems:"center", gap:7,
            background: invoiceDropdown
              ? "linear-gradient(135deg, #1B2E4B 0%, #2A4167 100%)"
              : "linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
            border:`1.5px solid ${invoiceDropdown ? C.navy : "#FCD34D"}`,
            borderRadius:8, padding:"8px 14px", cursor:"pointer",
            fontFamily:T.body, fontSize:11, fontWeight:700,
            color: invoiceDropdown ? C.white : "#92400E",
            transition:"all .18s",
            boxShadow: invoiceDropdown ? "0 4px 14px #1B2E4B25" : "0 2px 8px #F59E0B15",
            flexShrink:0, whiteSpace:"nowrap",
          }}
          onMouseOver={e=>{ if(!invoiceDropdown){ e.currentTarget.style.background="linear-gradient(135deg, #FEF3C7 0%, #FEF9EE 100%)"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 5px 16px #F59E0B25"; }}}
          onMouseOut={e=>{ if(!invoiceDropdown){ e.currentTarget.style.background="linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px #F59E0B15"; }}}
        >
          <span style={{ fontSize:13 }}>📄</span>
          Créer la facture
          <span style={{
            fontSize:9, marginLeft:2, opacity:0.75,
            transform: invoiceDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition:"transform 0.2s", display:"inline-block",
          }}>▾</span>
        </button>

        {/* Dropdown menu */}
        {invoiceDropdown && (
          <div
            className="fade-up"
            style={{
              position:"absolute", bottom:"calc(100% + 8px)", left:0,
              background:C.white,
              border:`1px solid ${C.border}`,
              borderRadius:12, padding:8,
              boxShadow:"0 12px 40px #1B2E4B20",
              zIndex:200, minWidth:280,
              animation:"fadeUp 0.2s cubic-bezier(.22,.68,0,1.2) both",
            }}
          >
            <div style={{
              padding:"6px 10px 10px",
              fontFamily:T.body, fontSize:9, fontWeight:700,
              letterSpacing:"0.14em", color:C.textL,
              borderBottom:`1px solid ${C.borderL}`, marginBottom:6,
            }}>CHOISISSEZ LE TYPE DE FACTURE</div>

            {/* Option 1 — Acompte */}
            <button
              onClick={() => handleInvoiceAction("acompte")}
              style={{
                width:"100%", display:"flex", alignItems:"flex-start", gap:12,
                padding:"11px 12px", background:"transparent",
                border:"1.5px solid transparent", borderRadius:9,
                cursor:"pointer", textAlign:"left", transition:"all 0.15s",
              }}
              onMouseOver={e=>{ e.currentTarget.style.background="#FFFBEB"; e.currentTarget.style.borderColor="#FCD34D"; }}
              onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}
            >
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background:"linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, boxShadow:"0 3px 8px #F59E0B30",
              }}>💰</div>
              <div>
                <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:C.navy, marginBottom:2 }}>
                  Facture d'acompte
                  <span style={{
                    marginLeft:7, fontFamily:T.body, fontSize:9, fontWeight:700,
                    background:"#FEF3C7", color:"#92400E",
                    padding:"2px 7px", borderRadius:20, border:"1px solid #FCD34D",
                  }}>30%</span>
                </div>
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textM, lineHeight:1.5 }}>
                  Montant : <strong style={{color:"#15803D"}}>{depositAmt.toLocaleString("fr-FR")} €</strong>
                  <span style={{ color:C.textL }}> · À régler à la commande</span>
                </div>
                <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:2, lineHeight:1.5 }}>
                  Liée contractuellement au document scellé
                </div>
              </div>
            </button>

            <div style={{ height:1, background:C.borderL, margin:"4px 8px" }} />

            {/* Option 2 — Solde */}
            <button
              onClick={() => handleInvoiceAction("solde")}
              style={{
                width:"100%", display:"flex", alignItems:"flex-start", gap:12,
                padding:"11px 12px", background:"transparent",
                border:"1.5px solid transparent", borderRadius:9,
                cursor:"pointer", textAlign:"left", transition:"all 0.15s",
              }}
              onMouseOver={e=>{ e.currentTarget.style.background="#F0FDF4"; e.currentTarget.style.borderColor="#BBF7D0"; }}
              onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}
            >
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background:"linear-gradient(135deg, #15803D 0%, #22C55E 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, boxShadow:"0 3px 8px #15803D30",
              }}>✅</div>
              <div>
                <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:C.navy, marginBottom:2 }}>
                  Facture finale de solde
                  <span style={{
                    marginLeft:7, fontFamily:T.body, fontSize:9, fontWeight:700,
                    background:"#DCFCE7", color:"#166534",
                    padding:"2px 7px", borderRadius:20, border:"1px solid #BBF7D0",
                  }}>Solde</span>
                </div>
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textM, lineHeight:1.5 }}>
                  Montant mis à jour <span style={{ color:C.textL }}>selon les avenants</span>
                </div>
                <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:2, lineHeight:1.5 }}>
                  Clôture la mission contractuellement
                </div>
              </div>
            </button>

            <div style={{
              marginTop:6, padding:"8px 10px",
              background:C.creamD, borderRadius:7,
              fontFamily:T.body, fontSize:9.5, color:C.textL, lineHeight:1.55,
              display:"flex", alignItems:"flex-start", gap:6,
            }}>
              <span style={{ fontSize:11, flexShrink:0 }}>⚖️</span>
              <span>La facture porte le numéro du contrat et est conforme à la loi française de facturation (art. L441-9 C.com.).</span>
            </div>
          </div>
        )}
      </div>

      {/* Toast confirmation */}
      {invoiceToast && (
        <div style={{
          position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, pointerEvents:"none",
          animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"linear-gradient(135deg, #15803D 0%, #22C55E 100%)",
            color:"#fff", borderRadius:50, padding:"13px 26px",
            fontFamily:T.body, fontSize:13, fontWeight:600,
            boxShadow:"0 8px 32px #15803D40", whiteSpace:"nowrap",
          }}>
            {invoiceToast}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ CLIENT DASHBOARD ══ */
function ClientDashboard({ onOpenSign, onRelance, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "valider");
  const [contactModal, setContactModal] = useState(null);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(null); // { id, label }
  const [deletingClient, setDeletingClient] = useState(null); // id en cours d'animation
  const [avenantTarget, setAvenantTarget] = useState(null); // { mission, freelance, price, id }

  /* ── Notes par article ── */
  const [showArticleReview, setShowArticleReview] = useState(false); // toggle section articles
  const [openArticleComment, setOpenArticleComment] = useState(null); // articleId ouvert
  const [articleCommentTexts, setArticleCommentTexts] = useState({}); // { articleId: text }
  const [sentArticleComments, setSentArticleComments] = useState({}); // { articleId: true }
  const [commentSentToast, setCommentSentToast] = useState(false);

  const CONTRACT_ARTICLES = [
    { id:"art1", label:"Article 1 · Objet de la mission", icon:"📋" },
    { id:"art2", label:"Article 2 · Délais & Planning", icon:"📅" },
    { id:"art3", label:"Article 3 · Prix & Rémunération", icon:"💶" },
    { id:"art4", label:"Article 4 · Propriété Intellectuelle", icon:"©️" },
    { id:"art5", label:"Article 5 · Confidentialité", icon:"🔒" },
    { id:"art6", label:"Article 6 · Conditions de résiliation", icon:"📝" },
  ];

  const handleSendArticleComment = (article) => {
    const text = articleCommentTexts[article.id]?.trim();
    if (!text) return;
    const now = new Date();
    addClientTimelineEvent({
      id: Date.now(),
      date: now.toLocaleDateString("fr-FR"),
      time: now.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
      icon: "💬",
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      label: `Note sur ${article.label}`,
      detail: null,
      comment: text,
      author: "TechStart SAS",
      authorInitials: "TS",
      authorColor: "#7C3AED",
      clauseTag: article.label,
      status: "pending",
      type: "client_comment",
    });
    setSentArticleComments(prev => ({ ...prev, [article.id]: true }));
    setOpenArticleComment(null);
    setCommentSentToast(true);
    setTimeout(() => setCommentSentToast(false), 3000);
  };
  const [clientContracts, setClientContracts] = useState([]);
  const [enCoursContracts, setEnCoursContracts] = useState([]);

  const handleDeleteClient = (id, label) => {
    setConfirmDeleteClient({ id, label });
  };

  const confirmDeleteAction = () => {
    const id = confirmDeleteClient.id;
    setConfirmDeleteClient(null);
    setDeletingClient(id);
    setTimeout(() => {
      setClientContracts(prev => prev.filter(c => c.id !== id));
      setEnCoursContracts(prev => prev.filter(c => c.id !== id));
      setDeletingClient(null);
    }, 450);
  };

  const tabs = [
    { id:"valider", label:"⚡ À valider", badge:1 },
    { id:"encours", label:"🟢 En cours", badge:null },
    { id:"freelances", label:"🤝 Mes freelances", badge:null },
  ];

  const tabStyle = (id) => ({
    flex:1, padding:"12px 8px",
    background: activeTab===id ? C.white : "transparent",
    border:"none",
    borderBottom: activeTab===id ? `2px solid ${C.navy}` : "2px solid transparent",
    color: activeTab===id ? C.navy : C.textL,
    cursor:"pointer", fontFamily:T.body, fontSize:12, fontWeight:700,
    letterSpacing:"0.02em", transition:"all .18s",
    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
    position:"relative",
  });

  const freelances = [];

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 20px 80px" }}>

      {/* Toast note envoyée */}
      {commentSentToast && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:9999, pointerEvents:"none", animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg, #4338CA 0%, #5B50E8 100%)", color:"#fff", borderRadius:50, padding:"13px 26px", fontFamily:T.body, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px #4338CA40", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:16 }}>💬</span>
            Note envoyée au freelance avec succès !
          </div>
        </div>
      )}

      {/* Header client */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.2em", color:"#7C3AED", fontWeight:700, marginBottom:8 }}>ESPACE CLIENT</div>
        <h1 style={{ fontFamily:T.display, fontSize:28, color:C.navy, fontWeight:700, marginBottom:4, lineHeight:1.2 }}>
          Espace Client 👋
        </h1>
        <p style={{ fontFamily:T.body, fontSize:13, color:C.textL }}>
          Gérez vos contrats et vos prestataires en toute simplicité.
        </p>
      </div>

      {/* Tabs */}
      <div className="fade-up fade-up-1" style={{
        display:"flex",
        background:C.creamD,
        borderRadius:12, padding:4,
        marginBottom:24,
        border:`1px solid ${C.border}`,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex:1, padding:"10px 6px",
            background: activeTab===t.id ? C.white : "transparent",
            border:"none",
            borderRadius:9,
            color: activeTab===t.id ? C.navy : C.textL,
            cursor:"pointer", fontFamily:T.body, fontSize:11, fontWeight:700,
            letterSpacing:"0.02em", transition:"all .18s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            boxShadow: activeTab===t.id ? "0 2px 8px #1B2E4B10" : "none",
          }}>
            {t.label}
            {t.badge && (
              <span style={{
                background:"#EF4444", color:"#fff",
                fontSize:9, fontWeight:800,
                borderRadius:10, padding:"1px 6px", minWidth:16, textAlign:"center",
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1 : À valider ── */}
      {activeTab === "valider" && (
        <div className="fade-up">
          {clientContracts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", background:C.white, border:`1px solid ${C.border}`, borderRadius:14, color:C.textL, fontFamily:T.body, fontSize:13 }}>
              <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
              Aucun contrat en attente de validation.
            </div>
          ) : clientContracts.map((c) => (
          <div
            key={c.id}
            className={deletingClient === c.id ? "card-deleting" : ""}
            style={{
              background:"#FFFBEB", border:"1px solid #FDE68A",
              borderRadius:16, padding:"20px 20px 18px",
              boxShadow:"0 4px 20px #F59E0B10",
              position:"relative", overflow:"hidden",
              marginBottom:12,
            }}
          >
            {/* Barre top accent */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg, #F59E0B, #FBBF24)", borderRadius:"16px 16px 0 0" }} />

            {/* Boutons Dupliquer + Relancer + Supprimer */}
            <div style={{ position:"absolute", top:14, right:14, display:"flex", gap:6, zIndex:2 }}>
              <button
                onClick={() => setClientContracts(prev => [
                  ...prev,
                  { ...c, id: Date.now().toString(), mission: c.mission + " (Copie)" }
                ])}
                title="Dupliquer ce contrat"
                style={{
                  width:30, height:30, borderRadius:7,
                  background:"#EFF6FF", border:"1.5px solid #93C5FD",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, transition:"all .18s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="#DBEAFE"; e.currentTarget.style.borderColor="#60A5FA"; e.currentTarget.style.transform="scale(1.1)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#EFF6FF"; e.currentTarget.style.borderColor="#93C5FD"; e.currentTarget.style.transform="scale(1)"; }}
              >📋</button>
              <button
                onClick={() => { if(onRelance) onRelance(); }}
                title="Relancer le freelance"
                style={{
                  height:30, padding:"0 10px", borderRadius:7,
                  background:"#F0FDF4", border:"1.5px solid #86EFAC",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  gap:4, fontSize:11, fontFamily:T.body, fontWeight:700, color:"#15803D",
                  transition:"all .18s", whiteSpace:"nowrap",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="#DCFCE7"; e.currentTarget.style.borderColor="#4ADE80"; e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#F0FDF4"; e.currentTarget.style.borderColor="#86EFAC"; e.currentTarget.style.transform="scale(1)"; }}
              >⚡ Relancer</button>
              <button
                onClick={() => handleDeleteClient(c.id, c.mission)}
                title="Supprimer ce contrat"
                style={{
                  width:30, height:30, borderRadius:7,
                  background:"#FEF2F2", border:"1.5px solid #FECACA",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, transition:"all .18s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor="#FCA5A5"; e.currentTarget.style.transform="scale(1.1)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; e.currentTarget.style.transform="scale(1)"; }}
              >🗑️</button>
            </div>

            <div style={{ display:"flex", alignItems:"flex-start", gap:14, paddingRight:76 }}>
              <div style={{
                width:44, height:44, borderRadius:12, flexShrink:0,
                background:"linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, boxShadow:"0 4px 12px #F59E0B30",
              }}>⚡</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:T.body, fontSize:11, fontWeight:800, color:"#92400E", letterSpacing:"0.12em", marginBottom:4 }}>ACTION REQUISE</div>
                <div style={{ fontFamily:T.display, fontSize:17, color:"#78350F", fontWeight:600, marginBottom:6, lineHeight:1.3 }}>
                  1 contrat en attente de validation
                </div>
                <div style={{ background:"#FFFBF0", border:"1px solid #FDE68A", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                    <div>
                      <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:C.navy, marginBottom:3 }}>
                        📄 {c.mission}
                      </div>
                      <div style={{ fontFamily:T.body, fontSize:12, color:C.textM, marginBottom:2 }}>
                        Par <strong>{c.freelance}</strong>
                      </div>
                      <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>
                        Du 15 juin → 15 sept. 2026
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:T.display, fontSize:20, color:"#15803D", fontWeight:700 }}>{c.price}</div>
                      <div style={{ fontFamily:T.body, fontSize:10, color:"#166534", fontWeight:600 }}>Paiement comptant</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onOpenSign}
                  style={{
                    width:"100%", padding:"14px",
                    background:"linear-gradient(135deg, #1B2E4B 0%, #2A4167 100%)",
                    color:C.white, border:"none", borderRadius:12, cursor:"pointer",
                    fontFamily:T.body, fontSize:14, fontWeight:800,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    boxShadow:"0 6px 24px #1B2E4B40", transition:"all 0.2s", letterSpacing:"0.02em",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 32px #1B2E4B50"; }}
                  onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 24px #1B2E4B40"; }}
                >
                  <span style={{ fontSize:18 }}>📄</span>
                  Ouvrir et Signer le contrat
                  <span style={{ marginLeft:"auto", fontSize:16, opacity:0.7 }}>→</span>
                </button>

                {/* ── Section révision par article ── */}
                <div style={{ marginTop:16 }}>
                  <button
                    onClick={() => setShowArticleReview(v => !v)}
                    style={{
                      width:"100%", padding:"11px 14px",
                      background: showArticleReview ? "#EEF2FF" : C.white,
                      border:`1.5px solid ${showArticleReview ? "#A5B4FC" : C.border}`,
                      borderRadius:10, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      fontFamily:T.body, fontSize:12, fontWeight:700, color:"#4338CA",
                      transition:"all 0.18s",
                    }}
                    onMouseOver={e=>{ e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.borderColor="#A5B4FC"; }}
                    onMouseOut={e=>{ if(!showArticleReview){ e.currentTarget.style.background=C.white; e.currentTarget.style.borderColor=C.border; }}}
                  >
                    <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>💬</span>
                      Relire et suggérer des modifications
                    </span>
                    <span style={{ fontSize:14, transition:"transform 0.2s", transform: showArticleReview ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </button>

                  {showArticleReview && (
                    <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8, animation:"fadeUp 0.3s cubic-bezier(.22,.68,0,1.2) both" }}>
                      <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, padding:"0 4px 4px", lineHeight:1.6 }}>
                        Cliquez sur un article pour proposer une modification. Le prestataire recevra votre note directement.
                      </div>
                      {CONTRACT_ARTICLES.map(article => {
                        const isOpen = openArticleComment === article.id;
                        const isSent = sentArticleComments[article.id];
                        return (
                          <div key={article.id} style={{
                            background: isSent ? "#F0FDF4" : C.white,
                            border:`1px solid ${isSent ? "#BBF7D0" : isOpen ? "#A5B4FC" : C.border}`,
                            borderRadius:10,
                            overflow:"hidden",
                            transition:"all 0.2s",
                          }}>
                            {/* En-tête article */}
                            <div
                              onClick={() => !isSent && setOpenArticleComment(isOpen ? null : article.id)}
                              style={{
                                display:"flex", alignItems:"center", justifyContent:"space-between",
                                padding:"11px 14px", cursor: isSent ? "default" : "pointer",
                              }}
                            >
                              <span style={{ display:"flex", alignItems:"center", gap:8, fontFamily:T.body, fontSize:12, fontWeight:600, color: isSent ? "#15803D" : C.navy }}>
                                <span style={{ fontSize:13 }}>{isSent ? "✅" : article.icon}</span>
                                {article.label}
                              </span>
                              {isSent ? (
                                <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:"#15803D", background:"#DCFCE7", padding:"2px 8px", borderRadius:20 }}>Note envoyée</span>
                              ) : (
                                <span style={{
                                  display:"flex", alignItems:"center", gap:4,
                                  fontFamily:T.body, fontSize:10, fontWeight:700, color:"#4338CA",
                                  background:"#EEF2FF", padding:"3px 9px", borderRadius:20, border:"1px solid #C7D2FE",
                                }}>
                                  {isOpen ? "✕ Fermer" : "💬 Suggérer"}
                                </span>
                              )}
                            </div>

                            {/* Zone de saisie inline */}
                            {isOpen && !isSent && (
                              <div style={{ padding:"0 14px 14px", animation:"fadeUp 0.25s cubic-bezier(.22,.68,0,1.2) both" }}>
                                <textarea
                                  autoFocus
                                  value={articleCommentTexts[article.id] || ""}
                                  onChange={e => setArticleCommentTexts(prev => ({ ...prev, [article.id]: e.target.value }))}
                                  placeholder="Proposez vos changements pour cet article…"
                                  rows={3}
                                  style={{
                                    width:"100%", padding:"10px 12px",
                                    fontFamily:T.body, fontSize:12, color:C.text,
                                    background:"#F8F7FF", border:"1.5px solid #A5B4FC",
                                    borderRadius:8, resize:"vertical", lineHeight:1.6,
                                    outline:"none", boxSizing:"border-box",
                                    minHeight:72,
                                  }}
                                />
                                <button
                                  onClick={() => handleSendArticleComment(article)}
                                  disabled={!articleCommentTexts[article.id]?.trim()}
                                  style={{
                                    marginTop:8, width:"100%", padding:"11px",
                                    background: articleCommentTexts[article.id]?.trim()
                                      ? "linear-gradient(135deg, #4338CA 0%, #5B50E8 100%)"
                                      : C.creamDD,
                                    color: articleCommentTexts[article.id]?.trim() ? C.white : C.textL,
                                    border:"none", borderRadius:8, cursor: articleCommentTexts[article.id]?.trim() ? "pointer" : "default",
                                    fontFamily:T.body, fontSize:12, fontWeight:700,
                                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                                    transition:"all 0.18s",
                                    boxShadow: articleCommentTexts[article.id]?.trim() ? "0 4px 14px #4338CA30" : "none",
                                  }}
                                >
                                  <span style={{ fontSize:13 }}>✉️</span>
                                  Envoyer la note au freelance
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          ))}

          {/* Infos rassurantes */}
          <div style={{
            background:C.white, border:`1px solid ${C.border}`,
            borderRadius:12, padding:"14px 18px",
            display:"flex", alignItems:"center", gap:12,
          }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🔒</span>
            <div style={{ fontFamily:T.body, fontSize:12, color:C.textM, lineHeight:1.6 }}>
              Votre signature est <strong style={{color:C.navy}}>chiffrée et horodatée</strong>. Paiement sécurisé via Freeley.
            </div>
          </div>
        </div>
      )}
      {activeTab === "encours" && (
        <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginBottom:4 }}>
            {enCoursContracts.length} contrat{enCoursContracts.length !== 1 ? "s" : ""} actif{enCoursContracts.length !== 1 ? "s" : ""} en cours d'exécution
          </div>

          {enCoursContracts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", background:C.white, border:`1px solid ${C.border}`, borderRadius:14, color:C.textL, fontFamily:T.body, fontSize:13 }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
              Aucun contrat en cours.
            </div>
          ) : enCoursContracts.map((c, i) => (
            <div
              key={c.id}
              className={deletingClient === c.id ? "card-deleting" : ""}
              style={{
                background:C.white, border:`1px solid ${C.border}`,
                borderRadius:14, padding:"18px 20px",
                boxShadow:"0 2px 8px #1B2E4B05",
                animation:`fadeUp 0.4s ${i * 0.08}s both cubic-bezier(.22,.68,0,1.2)`,
                position:"relative",
              }}
            >
              {/* Boutons Dupliquer + Supprimer */}
              <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:6, zIndex:2 }}>
                <button
                  onClick={() => setEnCoursContracts(prev => [
                    ...prev,
                    { ...c, id: Date.now().toString(), mission: c.mission + " (Copie)" }
                  ])}
                  title="Dupliquer ce contrat"
                  style={{
                    width:30, height:30, borderRadius:7,
                    background:"#EFF6FF", border:"1.5px solid #93C5FD",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, transition:"all .18s",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.background="#DBEAFE"; e.currentTarget.style.borderColor="#60A5FA"; e.currentTarget.style.transform="scale(1.1)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.background="#EFF6FF"; e.currentTarget.style.borderColor="#93C5FD"; e.currentTarget.style.transform="scale(1)"; }}
                >📋</button>
                <button
                  onClick={() => handleDeleteClient(c.id, c.mission)}
                  title="Supprimer ce contrat"
                  style={{
                    width:30, height:30, borderRadius:7,
                    background:"#FEF2F2", border:"1.5px solid #FECACA",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, transition:"all .18s",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor="#FCA5A5"; e.currentTarget.style.transform="scale(1.1)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; e.currentTarget.style.transform="scale(1)"; }}
                >🗑️</button>
              </div>

              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12, gap:10, paddingRight:76 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:40, height:40, borderRadius:10, flexShrink:0,
                    background:"#F0FDF4", border:"1.5px solid #BBF7D0",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  }}>🔒</div>
                  <div>
                    <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:C.navy, marginBottom:2 }}>
                      {c.mission}
                    </div>
                    <div style={{ fontFamily:T.body, fontSize:12, color:C.textL }}>
                      Avec <strong style={{color:C.navy}}>{c.freelance}</strong> · {c.date}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:T.display, fontSize:16, color:C.navy, fontWeight:600 }}>{c.price}</div>
                  <span style={{
                    fontFamily:T.body, fontSize:9, background:"#DCFCE7", color:"#15803D",
                    padding:"2px 8px", borderRadius:20, fontWeight:700, letterSpacing:"0.05em",
                  }}>✓ CONTRAT SCELLÉ</span>
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>Avancement de la mission</span>
                  <span style={{ fontFamily:T.body, fontSize:10, color:C.navy, fontWeight:700 }}>{c.progress}%</span>
                </div>
                <div style={{ background:C.creamDD, borderRadius:6, height:6, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:6,
                    background:"linear-gradient(90deg, #16A34A, #22C55E)",
                    width:`${c.progress}%`, transition:"width 1s ease",
                  }} />
                </div>
              </div>

              {/* Bouton avenant */}
              <div style={{ marginBottom:10 }}>
                <button
                  onClick={() => setAvenantTarget(c)}
                  style={{
                    width:"100%", padding:"11px 16px",
                    background:"linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
                    border:"1.5px solid #FCD34D",
                    borderRadius:10, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:10,
                    transition:"all 0.2s",
                    boxShadow:"0 2px 6px #B8965A10",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.background="linear-gradient(135deg, #FEF3C7 0%, #FEF9EE 100%)"; e.currentTarget.style.boxShadow="0 5px 16px #B8965A25"; e.currentTarget.style.transform="translateY(-1px)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.background="linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)"; e.currentTarget.style.boxShadow="0 2px 6px #B8965A10"; e.currentTarget.style.transform="translateY(0)"; }}
                >
                  <div style={{
                    width:28, height:28, borderRadius:7, flexShrink:0,
                    background:"linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, boxShadow:"0 3px 8px #F59E0B30",
                  }}>➕</div>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <span style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#92400E" }}>
                      Créer un avenant
                    </span>
                    <span style={{
                      marginLeft:8, fontFamily:T.body, fontSize:9, fontWeight:700,
                      background:"#F59E0B", color:C.white,
                      padding:"2px 7px", borderRadius:20, letterSpacing:"0.05em",
                      verticalAlign:"middle",
                    }}>Ajout / Modification</span>
                  </div>
                  <span style={{ fontSize:14, color:"#F59E0B", fontWeight:700, flexShrink:0 }}>→</span>
                </button>
                {/* Note explicative */}
                <div style={{
                  display:"flex", alignItems:"flex-start", gap:6,
                  marginTop:6, padding:"6px 12px",
                  fontFamily:T.body, fontSize:10,
                  color:C.textL, fontStyle:"italic", lineHeight:1.55,
                }}>
                  <span style={{ fontSize:11, flexShrink:0, marginTop:1 }}>ℹ️</span>
                  <span>Un avenant permet de modifier le prix ou d'ajouter des prestations en cours de mission sans refaire tout le contrat, tout en restant couvert contractuellement.</span>
                </div>
              </div>

              {/* ── Barre d'actions PDF + Facture ── */}
              <EnCoursActionsBar c={c} />
            </div>
          ))}
        </div>
      )}

      {/* Avenant Modal — depuis tableau de bord client */}
      {avenantTarget && (
        <AvenantModal
          form={{
            freelanceName: avenantTarget.freelance,
            freelanceActivity: "",
            freelanceSiret: "",
            freelanceAddress: "",
            freelanceEmail: "",
            clientName: "",
            clientCompany: "",
            clientAddress: "",
            clientEmail: "",
            missionTitle: avenantTarget.mission,
            missionDescription: "",
            startDate: "",
            endDate: "",
            price: avenantTarget.price ? avenantTarget.price.replace(/[^0-9]/g, "") : "",
            paymentTerms: "Comptant",
            revisions: "2",
            latePaymentPenalty: true,
          }}
          contract={""}
          avenantCount={0}
          onClose={() => setAvenantTarget(null)}
          onCreated={() => {}}
        />
      )}

      {/* ── TAB 3 : Mes Freelances ── */}
      {activeTab === "freelances" && (
        <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginBottom:4 }}>
            Vos prestataires de confiance
          </div>

          {freelances.map((f, i) => (
            <div key={i} style={{
              background:C.white, border:`1px solid ${C.border}`,
              borderRadius:16, padding:"20px",
              boxShadow:"0 2px 12px #1B2E4B06",
              animation:`fadeUp 0.4s ${i * 0.1}s both cubic-bezier(.22,.68,0,1.2)`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                {/* Avatar */}
                <div style={{
                  width:52, height:52, borderRadius:14, flexShrink:0,
                  background:`linear-gradient(135deg, ${f.color} 0%, ${f.color}CC 100%)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:T.body, fontSize:18, fontWeight:800, color:"#fff",
                  boxShadow:`0 4px 14px ${f.color}30`,
                }}>{f.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <div style={{ fontFamily:T.body, fontSize:15, fontWeight:700, color:C.navy }}>{f.name}</div>
                    <span style={{ fontFamily:T.body, fontSize:10, color:"#F59E0B", fontWeight:700 }}>{f.note}</span>
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:12, color:C.textL }}>{f.job}</div>
                </div>
              </div>

              {/* Tags compétences */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                {f.tags.map(tag => (
                  <span key={tag} style={{
                    background:C.creamD, border:`1px solid ${C.border}`,
                    borderRadius:20, padding:"4px 10px",
                    fontFamily:T.body, fontSize:11, fontWeight:600, color:C.navy,
                  }}>{tag}</span>
                ))}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => setContactModal(f)}
                  style={{
                    flex:1, padding:"10px",
                    background:C.navy, color:C.white,
                    border:"none", borderRadius:9, cursor:"pointer",
                    fontFamily:T.body, fontSize:12, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    transition:"all .18s",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.background=C.navyL; }}
                  onMouseOut={e=>{ e.currentTarget.style.background=C.navy; }}
                >
                  ✉️ Contacter
                </button>
                <button style={{
                  padding:"10px 14px",
                  background:"none", border:`1px solid ${C.border}`,
                  borderRadius:9, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, color:C.textM,
                  transition:"all .18s",
                }}
                  onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
                  onMouseOut={e=>{ e.currentTarget.style.background="none"; }}
                >📄 Contrats</button>
              </div>
            </div>
          ))}

          {/* Ajouter un freelance */}
          <div style={{
            border:`1.5px dashed ${C.border}`, borderRadius:14,
            padding:"20px", textAlign:"center",
            background:"transparent",
          }}>
            <div style={{ fontSize:24, marginBottom:8 }}>➕</div>
            <div style={{ fontFamily:T.body, fontSize:13, color:C.textL }}>
              Inviter un prestataire
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {confirmDeleteClient && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"12px",
          backdropFilter:"blur(3px)",
          animation:"fadeUp 0.2s ease both",
        }} onClick={e => e.target === e.currentTarget && setConfirmDeleteClient(null)}>
          <div className="fade-up" style={{
            background:C.white, borderRadius:16, padding:"24px 16px",
            maxWidth:380, width:"100%", boxShadow:"0 24px 64px #00000035",
          }}>
            <div style={{ fontSize:32, marginBottom:12, textAlign:"center" }}>⚠️</div>
            <div style={{ fontFamily:T.display, fontSize:21, color:C.navy, marginBottom:10, textAlign:"center" }}>
              Supprimer ce contrat ?
            </div>
            <p style={{ fontFamily:T.body, fontSize:13, color:C.textM, marginBottom:8, lineHeight:1.7, textAlign:"center" }}>
              <strong style={{color:C.navy}}>« {confirmDeleteClient.label} »</strong>
            </p>
            <p style={{ fontFamily:T.body, fontSize:12, color:"#7A4A4A", marginBottom:28, lineHeight:1.7, textAlign:"center", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px" }}>
              Attention, cette action effacera définitivement ce document de votre espace et annulera son scellé numérique.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDeleteClient(null)} style={{
                flex:1, padding:"12px", background:C.white, border:`1.5px solid ${C.border}`,
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM, fontWeight:500,
                transition:"all .15s",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >Annuler</button>
              <button onClick={confirmDeleteAction} style={{
                flex:1, padding:"12px", background:"#C0392B", border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.white, fontWeight:700,
                transition:"all .15s", boxShadow:"0 4px 14px #C0392B30",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background="#A93226"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#C0392B"; e.currentTarget.style.transform="translateY(0)"; }}
              >🗑️ Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal contact */}
      {contactModal && (
        <div style={{
          position:"fixed", inset:0, background:"#00000060", zIndex:400,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"12px",
        }} onClick={e => e.target === e.currentTarget && setContactModal(null)}>
          <div className="fade-up" style={{
            background:C.white, borderRadius:16, padding:"24px 16px",
            maxWidth:360, width:"100%", boxShadow:"0 24px 64px #00000030",
          }}>
            <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, marginBottom:6 }}>
              Contacter {contactModal.name}
            </div>
            <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginBottom:20 }}>
              {contactModal.job}
            </div>
            <a href={`mailto:${contactModal.email}`} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              width:"100%", padding:"12px",
              background:C.navy, color:C.white,
              border:"none", borderRadius:10, cursor:"pointer",
              fontFamily:T.body, fontSize:13, fontWeight:700,
              textDecoration:"none", marginBottom:10,
            }}>✉️ Envoyer un email</a>
            <button onClick={() => setContactModal(null)} style={{
              width:"100%", padding:"11px",
              background:C.creamD, border:`1px solid ${C.border}`,
              borderRadius:10, cursor:"pointer",
              fontFamily:T.body, fontSize:13, color:C.textM,
            }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ COMPONENTS ══ */

/* ── InstantToolsBar : barre d'outils IA en haut de page ── */
function InstantToolsBar({ onNda, onRecouvrement, onScanner, onInvoice, onProfile }) {
  const [openTip, setOpenTip] = useState(null);

  const TOOLS = [
    {
      id: "nda",
      icon: "🔒",
      label: "Générer un NDA",
      accent: C.navy,
      accentLight: "#EFF6FF",
      accentBorder: "#BFDBFE",
      accentText: "#1D4ED8",
      onClick: onNda,
      title: "Accord de confidentialité instantané",
      description: "Protégez vos idées avant d'envoyer un brief.",
      example: "Votre client a une idée de projet secrète, l'IA génère un accord de confidentialité conforme en 2 secondes.",
    },
    {
      id: "recouvrement",
      icon: "🚨",
      label: "Recouvrement Ferme",
      accent: "#DC2626",
      accentLight: "#FEF2F2",
      accentBorder: "#FECACA",
      accentText: "#B91C1C",
      onClick: onRecouvrement,
      title: "Mise en demeure commerciale",
      description: "Relancez vos factures en retard efficacement.",
      example: "Un client a dépassé l'échéance, l'IA génère une mise en demeure officielle citant le Code de commerce.",
    },
    {
      id: "scanner",
      icon: "🔍",
      label: "Scanner un contrat",
      accent: "#0369A1",
      accentLight: "#F0F9FF",
      accentBorder: "#BAE6FD",
      accentText: "#0284C7",
      onClick: onScanner,
      title: "Analyse IA du contrat",
      description: "Analysez instantanément les failles d'un contrat envoyé par un client.",
      example: "Avant de signer, l'IA détecte les clauses abusives ou déséquilibrées qui pourraient vous exposer.",
    },
    {
      id: "invoice",
      icon: "📄",
      label: "Facture d'acompte",
      accent: C.gold,
      accentLight: "#FFFBEB",
      accentBorder: "#FDE68A",
      accentText: "#92400E",
      onClick: onInvoice,
      title: "Facture PDF automatique",
      description: "Générez un PDF de facture d'acompte propre dès la signature.",
      example: "Bloquez le démarrage de production avec une facture d'acompte professionnelle générée en un clic.",
    },
    {
      id: "profile",
      icon: "👤",
      label: "Mon Profil",
      accent: "#059669",
      accentLight: "#ECFDF5",
      accentBorder: "#A7F3D0",
      accentText: "#065F46",
      onClick: onProfile,
      title: "Profil freelance complet",
      description: "Gérez vos informations, compétences et liens professionnels.",
      example: "Votre nom, SIRET et titre se remplissent automatiquement dans chaque contrat généré.",
    },
  ];

  const activeTool = TOOLS.find(t => t.id === openTip);

  return (
    <div style={{
      background: C.white,
      borderBottom: `1px solid ${C.borderL}`,
      padding: "0 16px",
    }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "10px 0 0" }}>

        {/* Titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{
            fontFamily: T.body, fontSize: 10, letterSpacing: "0.16em",
            color: C.textL, fontWeight: 700,
          }}>VOS OUTILS IA INSTANTANÉS</span>
        </div>

        {/* Grille 2 colonnes — boutons uniquement */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
          marginBottom: openTip ? 0 : 10,
        }}>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              className="instant-action-btn"
              onClick={() => setOpenTip(openTip === tool.id ? null : tool.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 12px",
                width: "100%",
                background: openTip === tool.id ? tool.accentLight : "transparent",
                border: `1px solid ${openTip === tool.id ? tool.accentBorder : C.border}`,
                borderRadius: openTip === tool.id ? "8px 8px 0 0" : 8,
                cursor: "pointer",
                fontFamily: T.body, fontSize: 12, fontWeight: 600,
                color: openTip === tool.id ? tool.accentText : C.textM,
                transition: "all .18s",
                justifyContent: "space-between",
              }}
              onMouseOver={e => {
                if (openTip !== tool.id) {
                  e.currentTarget.style.background = tool.accentLight;
                  e.currentTarget.style.borderColor = tool.accentBorder;
                  e.currentTarget.style.color = tool.accentText;
                }
              }}
              onMouseOut={e => {
                if (openTip !== tool.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.textM;
                }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{tool.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.label}</span>
              </span>
              <span style={{
                fontSize: 9, opacity: 0.55, flexShrink: 0,
                transform: openTip === tool.id ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                display: "inline-block",
              }}>▾</span>
            </button>
          ))}
        </div>

        {/* Panneau de détail — inline, pleine largeur, sous la grille */}
        {activeTool && (
          <div
            className="fade-up"
            style={{
              width: "100%",
              background: activeTool.accentLight,
              border: `1.5px solid ${activeTool.accentBorder}`,
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              padding: "16px",
              marginBottom: 10,
              animation: "fadeUp 0.18s ease both",
            }}
          >
            {/* Header outil */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: C.white,
                border: `1.5px solid ${activeTool.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15,
              }}>{activeTool.icon}</div>
              <div style={{
                fontFamily: T.body, fontSize: 13, fontWeight: 700,
                color: activeTool.accentText, lineHeight: 1.3,
              }}>{activeTool.title}</div>
            </div>

            {/* Description */}
            <div style={{
              fontFamily: T.body, fontSize: 12, color: C.textM,
              lineHeight: 1.6, marginBottom: 10,
            }}>{activeTool.description}</div>

            {/* Exemple */}
            <div style={{
              background: C.white,
              border: `1px solid ${activeTool.accentBorder}`,
              borderRadius: 8, padding: "9px 12px",
              fontFamily: T.body, fontSize: 11, color: activeTool.accentText,
              lineHeight: 1.6, marginBottom: 12,
            }}>
              <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", opacity: 0.7, display: "block", marginBottom: 3 }}>EXEMPLE</span>
              {activeTool.example}
            </div>

            {/* CTA */}
            <button
              onClick={() => { setOpenTip(null); activeTool.onClick(); }}
              style={{
                width: "100%", padding: "11px",
                background: `linear-gradient(135deg, ${activeTool.accent} 0%, ${activeTool.accent}CC 100%)`,
                color: "#fff", border: "none", borderRadius: 8,
                fontFamily: T.body, fontSize: 13, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 7,
                boxShadow: `0 4px 14px ${activeTool.accent}30`,
              }}
            >
              {activeTool.icon} Lancer {activeTool.label}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
function Shell({ children }) {
  return <div style={{ minHeight:"100vh", background:C.cream, fontFamily:T.body, color:C.text }}>{children}</div>;
}

/* ══════════════════════════════════════════════════════════ ALERT CENTER ══ */
const ALERTS_DATA = [];

// Persistance du statut "lu" des alertes (localStorage)
const getReadAlertIds = () => {
  try { return JSON.parse(localStorage.getItem("freeley_read_alerts") || "[]"); } catch(e) { return []; }
};
const markAlertReadPersist = (id) => {
  try {
    const ids = getReadAlertIds();
    if (!ids.includes(id)) { ids.push(id); localStorage.setItem("freeley_read_alerts", JSON.stringify(ids)); }
  } catch(e) {}
};
const markAllAlertsReadPersist = (ids) => {
  try {
    const existing = getReadAlertIds();
    const merged = Array.from(new Set([...existing, ...ids]));
    localStorage.setItem("freeley_read_alerts", JSON.stringify(merged));
  } catch(e) {}
};

// Génère des alertes réelles à partir de l'historique des contrats
function buildAlertsFromHistory(history) {
  if (!Array.isArray(history) || !history.length) return [];
  const alerts = [];
  const now = new Date();
  history.forEach(c => {
    // Alerte 1 : mission terminée (date de fin passée) → relance paiement / recouvrement
    if (c.endDate) {
      const end = new Date(c.endDate);
      if (!isNaN(end) && end < now) {
        const daysLate = Math.floor((now - end) / (1000 * 60 * 60 * 24));
        if (daysLate >= 0) {
          alerts.push({
            id: "recouvre_" + c.id,
            read: false,
            icon: "⚠️",
            accentBg: "#FEF5F5",
            accentIcon: "#FEE2E2",
            accentBorder: "#FCA5A5",
            badgeBg: "#DC2626",
            badgeText: "PAIEMENT",
            title: "Paiement à relancer",
            detail: `Mission « ${c.missionTitle || "Sans titre"} »${c.clientName ? " · " + c.clientName : ""} terminée depuis ${daysLate} j${c.price ? " · " + c.price + " €" : ""}`,
            action: "recouvrement",
          });
        }
      }
    }
    // Alerte 2 : contrat non signé
    if (c.signatureStatus === "none" && c.date) {
      alerts.push({
        id: "sign_" + c.id,
        read: false,
        icon: "✍️",
        accentBg: "#FFFBEB",
        accentIcon: "#FEF3C7",
        accentBorder: "#FCD34D",
        badgeBg: "#D97706",
        badgeText: "SIGNATURE",
        title: "Signature en attente",
        detail: `Le contrat « ${c.missionTitle || "Sans titre"} » n'est pas encore signé électroniquement`,
        action: "mission",
      });
    }
  });
  return alerts;
}

function AlertCenter({ onOpenRecouvrement, onOpenNda, onOpenMission, onClose, initialAlerts = [], onAlertsChanged }) {
  const panelRef = useRef(null);
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => {
    markAllAlertsReadPersist(alerts.map(a => a.id));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    if (onAlertsChanged) onAlertsChanged();
  };

  const handleAlertClick = (alert) => {
    // Marquer immédiatement comme lue AVANT la redirection (persistant)
    markAlertReadPersist(alert.id);
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    if (onAlertsChanged) onAlertsChanged();
    // Puis déclencher l'action après un léger délai pour que l'animation soit visible
    setTimeout(() => {
      onClose();
      if (alert.action === "nda") onOpenNda();
      else onOpenMission(alert);
    }, 160);
  };

  return (
    <div
      ref={panelRef}
      style={{
        position:"fixed",
        top:64, /* juste sous le header */
        left:"50%",
        transform:"translateX(-50%)",
        width:"min(360px, calc(100vw - 16px))",
        background:C.white,
        border:`1px solid ${C.border}`,
        borderRadius:16,
        boxShadow:"0 20px 60px rgba(27,46,75,0.16), 0 4px 16px rgba(27,46,75,0.08)",
        zIndex:200,
        animation:"alertSlideDown 0.22s cubic-bezier(.22,.68,0,1.2) both",
        overflow:"hidden",
        maxHeight:"calc(100vh - 80px)",
        overflowY:"auto",
      }}
    >
      {/* Header du panneau */}
      <div style={{
        padding:"16px 18px 14px",
        borderBottom:`1px solid ${C.borderL}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"linear-gradient(135deg, #F7F5F0 0%, #FFFFFF 100%)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, boxShadow:`0 3px 10px ${C.navy}30`,
          }}>🔔</div>
          <div>
            <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, lineHeight:1.2 }}>
              Centre d'Alertes
            </div>
            <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:1 }}>
              {unreadCount > 0
                ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} alerte${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes les alertes sont lues"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width:26, height:26, borderRadius:7,
            background:C.creamD, border:`1px solid ${C.border}`,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, color:C.textL, lineHeight:1,
            transition:"all .15s",
          }}
          onMouseOver={e=>{ e.currentTarget.style.background=C.creamDD; }}
          onMouseOut={e=>{ e.currentTarget.style.background=C.creamD; }}
        >×</button>
      </div>

      {/* Liste des alertes */}
      <div style={{ padding:"8px 0 6px" }}>
        {alerts.map((alert, i) => {
          const isUnread = !alert.read;
          return (
            <div
              key={alert.id}
              className="alert-row"
              onClick={() => handleAlertClick(alert)}
              style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"12px 16px",
                cursor: alert.action !== "none" ? "pointer" : "default",
                borderBottom: i < alerts.length - 1 ? `1px solid ${C.borderL}` : "none",
                background: isUnread ? alert.accentBg : "transparent",
                position:"relative",
                opacity: isUnread ? 1 : 0.55,
                transition:"background 0.25s ease, opacity 0.25s ease",
              }}
            >
              {/* Barre latérale couleur (toujours présente) */}
              <div style={{
                position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
                width:3, height:28, borderRadius:"0 4px 4px 0",
                background: alert.dotColor,
                opacity: isUnread ? 0.85 : 0.3,
                transition:"opacity 0.25s ease",
              }} />

              {/* Pastille bleue "non lue" */}
              <div style={{
                width:8, height:8, borderRadius:"50%", flexShrink:0,
                background: isUnread ? "#3B82F6" : "transparent",
                boxShadow: isUnread ? "0 0 0 2px #BFDBFE, 0 0 8px #3B82F670" : "none",
                transition:"all 0.25s ease",
                marginLeft:2,
              }} />

              {/* Icône */}
              <div style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                background: isUnread ? alert.accentIcon : C.creamD,
                border:`1.5px solid ${isUnread ? alert.accentBorder : C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:17,
                transition:"background 0.25s ease, border-color 0.25s ease",
              }}>{alert.icon}</div>

              {/* Contenu */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{
                    fontFamily:T.body, fontSize:12,
                    fontWeight: isUnread ? 700 : 500,
                    color: isUnread ? C.navy : C.textM,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    transition:"color 0.25s ease, font-weight 0.25s ease",
                  }}>{alert.title}</span>
                  <span style={{
                    fontFamily:T.body, fontSize:8, fontWeight:800, letterSpacing:"0.08em",
                    background: isUnread ? alert.badgeBg : "#9CA3AF",
                    color:"#fff",
                    borderRadius:20, padding:"2px 6px", flexShrink:0,
                    transition:"background 0.25s ease",
                  }}>{alert.badgeText}</span>
                </div>
                <div style={{
                  fontFamily:T.body, fontSize:11,
                  color: isUnread ? C.textM : C.textL,
                  lineHeight:1.45,
                  whiteSpace:"normal", wordBreak:"break-word",
                  display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden",
                  transition:"color 0.25s ease",
                }}>{alert.detail}</div>
              </div>

              {/* Flèche si cliquable */}
              {alert.action !== "none" && (
                <div style={{
                  fontSize:14, color: isUnread ? C.textL : C.creamDD, flexShrink:0,
                  transition:"color 0.25s ease",
                }}>›</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding:"10px 16px",
        borderTop:`1px solid ${C.borderL}`,
        background:C.cream,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>
          Mis à jour à l'instant
        </span>
        <span
          onClick={markAllRead}
          style={{
            fontFamily:T.body, fontSize:10, fontWeight:700,
            color: unreadCount > 0 ? C.navy : C.textL,
            cursor: unreadCount > 0 ? "pointer" : "default",
            textDecoration: unreadCount > 0 ? "underline" : "none",
            textDecorationStyle:"dotted",
            transition:"color 0.2s",
          }}
        >
          {unreadCount > 0 ? "Tout marquer comme lu" : "✓ Tout est lu"}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ HEADER ══ */
function Header({ isPremium, premiumPlan, left, onPricing, onHome, onHistory, onDashboard, onCGU, historyCount, authUser, onAuthClick, onSignOut, onProfile, profile, onOpenRecouvrement, onOpenNda, onOpenMission, onAlertsChanged, alerts = [] }) {
  const planLabel = premiumPlan==="unite" ? "📄 Unité" : premiumPlan==="mensuel" ? "⭐ Mensuel" : premiumPlan==="annuel" ? "👑 Annuel" : null;
  const [userMenu, setUserMenu] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const profileName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const profileInitial = profileName ? profileName.charAt(0).toUpperCase() : authUser?.email?.charAt(0).toUpperCase() || "?";

  const ALERT_COUNT = alerts.filter(a => !a.read).length; // alertes dynamiques réelles

  /* ── Responsive breakpoint (JS-driven) ── */
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 600);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 12px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, position:"sticky", top:0, zIndex:20, boxShadow:"0 1px 0 #D8D4CB" }}>
      {/* ── Logo ── */}
      <div onClick={onHome} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", flexShrink:0 }}>
        <img src={FREELEY_LOGO} alt="Freeley" style={{ height:30, width:30, objectFit:"contain" }} />
        <span style={{ fontFamily:T.display, fontSize:17, color:C.navy, fontWeight:600, letterSpacing:"0.01em", whiteSpace:"nowrap" }}>Freeley</span>
      </div>

      {/* ── Actions droite ── */}
      <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 4 : 8, flexShrink:0 }}>

        {/* Compteur gratuits — masqué sur mobile */}
        {!isMobile && (isPremium ? (
          <span style={{ fontFamily:T.body, fontSize:11, color:C.success, background:"#F0FDF4", border:"1px solid #BBF7D0", padding:"4px 10px", borderRadius:20, fontWeight:500, whiteSpace:"nowrap" }}>
            {planLabel}
          </span>
        ) : (
          <span style={{ fontFamily:T.body, fontSize:11, color:C.textL, whiteSpace:"nowrap" }}>{left}/2 gratuits</span>
        ))}

        {/* Tableau de bord */}
        <button onClick={onDashboard} title="Tableau de bord" style={{
          display:"flex", alignItems:"center", gap:5,
          padding: isMobile ? "7px 8px" : "7px 12px",
          background:"transparent", border:`1.5px solid ${C.border}`,
          color:C.textM, borderRadius:7, cursor:"pointer", fontSize:12, fontFamily:T.body, fontWeight:500,
          transition:"all .18s", position:"relative", whiteSpace:"nowrap",
        }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.color=C.navy; }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textM; }}
        >
          <span style={{ fontSize:14 }}>📊</span>
          {!isMobile && "Tableau de bord"}
        </button>

        {/* Mes contrats — icône + badge */}
        <button onClick={onHistory} title="Mes contrats" style={{
          display:"flex", alignItems:"center", gap:5,
          padding: isMobile ? "7px 8px" : "7px 12px",
          background:"transparent", border:`1.5px solid ${C.border}`,
          color:C.textM, borderRadius:7, cursor:"pointer", fontSize:12, fontFamily:T.body, fontWeight:500,
          transition:"all .18s", position:"relative", whiteSpace:"nowrap",
        }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.color=C.navy; }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textM; }}
        >
          <span style={{ fontSize:14 }}>📁</span>
          {!isMobile && "Mes contrats"}
          {historyCount > 0 && (
            <span style={{
              background:C.navy, color:C.white, fontSize:9, fontWeight:700,
              borderRadius:10, padding:"1px 5px", minWidth:14, textAlign:"center",
            }}>{historyCount}</span>
          )}
        </button>

        {/* Tarifs — masqué sur mobile (accessible via menu) */}
        {!isMobile && (
          <button onClick={onPricing} style={{
            padding:"7px 14px", background:"transparent", border:`1.5px solid ${C.navy}`,
            color:C.navy, borderRadius:7, cursor:"pointer", fontSize:12, fontFamily:T.body, fontWeight:600,
            transition:"all .18s", whiteSpace:"nowrap",
          }}
            onMouseOver={e=>{e.currentTarget.style.background=C.navy; e.currentTarget.style.color=C.white;}}
            onMouseOut={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.navy;}}
          >Tarifs</button>
        )}

        {/* ── 🔔 CLOCHE ALERTES ── */}
        <div style={{ position:"relative" }} className="bell-btn">
          <button
            onClick={() => setAlertOpen(o => !o)}
            style={{
              width:38, height:38, borderRadius:10,
              background: alertOpen
                ? `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`
                : C.white,
              border: alertOpen
                ? `1.5px solid ${C.navy}`
                : `1.5px solid ${C.border}`,
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative", transition:"all .18s",
              boxShadow: alertOpen ? `0 4px 14px ${C.navy}28` : "none",
            }}
            onMouseOver={e=>{ if(!alertOpen){ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.background=C.creamD; }}}
            onMouseOut={e=>{ if(!alertOpen){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.white; }}}
            title="Centre d'alertes"
          >
            <span
              className="bell-icon"
              style={{
                fontSize:17,
                filter: alertOpen ? "brightness(10)" : "none",
                display:"inline-block",
              }}
            >🔔</span>
            {/* Pastille rouge — uniquement si des alertes */}
            {ALERT_COUNT > 0 && (
            <span style={{
              position:"absolute", top:4, right:4,
              width:16, height:16, borderRadius:"50%",
              background:"#EF4444",
              border:`2px solid ${C.white}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:T.body, fontSize:8, fontWeight:800, color:"#fff",
              animation:"badgePop 0.4s cubic-bezier(.22,.68,0,1.2) both",
              lineHeight:1,
            }}>{ALERT_COUNT}</span>
            )}
          </button>

          {/* Panneau alertes */}
          {alertOpen && (
            <AlertCenter
              initialAlerts={alerts}
              onClose={() => setAlertOpen(false)}
              onOpenRecouvrement={() => { setAlertOpen(false); if(onOpenRecouvrement) onOpenRecouvrement(); }}
              onOpenNda={() => { setAlertOpen(false); if(onOpenNda) onOpenNda(); }}
              onOpenMission={(alert) => { setAlertOpen(false); if(onOpenMission) onOpenMission(alert); }}
              onAlertsChanged={onAlertsChanged}
            />
          )}
        </div>

        {/* Auth button */}
        {authUser ? (
          <div style={{ position:"relative" }}>
            <button
              onClick={() => setUserMenu(m => !m)}
              style={{
                width:36, height:36, borderRadius:"50%",
                background: profile?.photo ? "transparent" : C.navy,
                border:`2px solid ${C.navyL}`,
                color:C.white, cursor:"pointer",
                fontSize:14, fontFamily:T.body, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden", padding:0,
              }}
            >
              {profile?.photo
                ? <img src={profile.photo} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : profileInitial}
            </button>
            {userMenu && (
              <div style={{
                position:"absolute", top:"calc(100% + 8px)", right:0,
                background:C.white, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"8px 0",
                boxShadow:"0 8px 24px #1B2E4B18", minWidth:200, zIndex:50,
              }}>
                <div style={{ padding:"8px 16px 12px", borderBottom:`1px solid ${C.borderL}` }}>
                  <div style={{ fontFamily:T.body, fontSize:12, fontWeight:600, color:C.navy, marginBottom:2 }}>{profileName || "Mon compte"}</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, wordBreak:"break-all" }}>{authUser.email}</div>
                </div>
                <button onClick={() => { setUserMenu(false); onProfile(); }} style={{
                  width:"100%", textAlign:"left",
                  padding:"10px 16px", background:"none", border:"none",
                  cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.navy,
                  display:"flex", alignItems:"center", gap:8,
                }}
                  onMouseOver={e=>e.currentTarget.style.background=C.creamD}
                  onMouseOut={e=>e.currentTarget.style.background="none"}
                >👤 Mon Profil</button>
                <button onClick={() => { setUserMenu(false); if(onCGU) onCGU(); }} style={{
                  width:"100%", textAlign:"left",
                  padding:"10px 16px", background:"none", border:"none",
                  cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM,
                  display:"flex", alignItems:"center", gap:8,
                }}
                  onMouseOver={e=>e.currentTarget.style.background=C.creamD}
                  onMouseOut={e=>e.currentTarget.style.background="none"}
                >📄 Conditions d'utilisation</button>
                <button onClick={() => { setUserMenu(false); onSignOut(); }} style={{
                  display:"block", width:"100%", textAlign:"left",
                  padding:"10px 16px", background:"none", border:"none",
                  cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.error,
                }}
                  onMouseOver={e=>e.currentTarget.style.background="#FEF2F2"}
                  onMouseOut={e=>e.currentTarget.style.background="none"}
                >← Se déconnecter</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onAuthClick} style={{
            padding: isMobile ? "7px 10px" : "7px 16px",
            background:C.navy, border:"none",
            color:C.white, borderRadius:7, cursor:"pointer",
            fontSize: isMobile ? 11 : 12,
            fontFamily:T.body, fontWeight:600,
            transition:"all .18s", whiteSpace:"nowrap",
          }}
            onMouseOver={e=>e.currentTarget.style.background=C.navyL}
            onMouseOut={e=>e.currentTarget.style.background=C.navy}
          >{isMobile ? "Connexion" : "Connexion"}</button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ AUTH MODAL ══ */
/* ══════════════════════════════════════════════════════════ NDA EXPRESS MODAL ══ */
function NdaExpressModal({ onClose }) {
  const [step, setStep]           = useState("form"); // "form" | "loading" | "result"
  const [partieA, setPartieA]     = useState("");
  const [partieB, setPartieB]     = useState("");
  const [objet, setObjet]         = useState("");
  const [nda, setNda]             = useState("");
  const [copying, setCopying]     = useState(false);
  const [dots, setDots]           = useState(1);

  useEffect(() => {
    if (step !== "loading") return;
    const id = setInterval(() => setDots(d => d < 3 ? d+1 : 1), 500);
    return () => clearInterval(id);
  }, [step]);

  const generate = async () => {
    if (!partieA.trim() || !partieB.trim() || !objet.trim()) return;
    setStep("loading");
    try {
      const prompt = `Tu es un avocat d'affaires français. Rédige un NDA (Non-Disclosure Agreement) express, complet et juridiquement solide en droit français, entre :

Partie A (divulgatrice) : ${partieA}
Partie B (réceptrice) : ${partieB}
Objet / contexte du projet confidentiel : ${objet}

Structure OBLIGATOIRE :
- En-tête : "ACCORD DE CONFIDENTIALITÉ (NDA)" + date du jour + N° NDA-[AAAA]-[4 chiffres]
- ARTICLE 1 — DÉFINITION DES INFORMATIONS CONFIDENTIELLES
- ARTICLE 2 — OBLIGATIONS DE CONFIDENTIALITÉ (durée : 3 ans)
- ARTICLE 3 — EXCLUSIONS (information déjà publique, connue indépendamment…)
- ARTICLE 4 — PROPRIÉTÉ DES INFORMATIONS
- ARTICLE 5 — DURÉE ET RÉSILIATION
- ARTICLE 6 — SANCTIONS ET RÉPARATION (référence art. 1240 Code civil, dommages et intérêts)
- ARTICLE 7 — LOI APPLICABLE ET JURIDICTION (droit français, tribunal compétent)
- BLOC SIGNATURES des deux parties

Commence DIRECTEMENT par l'en-tête, sans introduction. Utilise un registre juridique précis. Maximum 500 mots.`;

      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:1500, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      const text = (data.content||[]).map(i=>i.text||"").join("\n").trim();
      setNda(text);
      setStep("result");
    } catch(e) {
      setNda("Erreur de génération. Vérifie ta connexion et réessaie.");
      setStep("result");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(nda).then(() => { setCopying(true); setTimeout(()=>setCopying(false), 2000); });
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px",
    border:`1.5px solid ${C.border}`, borderRadius:10,
    fontSize:13, fontFamily:T.body, color:C.text, outline:"none",
    background:C.white, transition:"border-color 0.16s",
    boxSizing:"border-box",
  };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{ position:"fixed",inset:0,background:"rgba(10,18,32,0.74)",zIndex:10100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(10px)" }}>
      <div className="fade-up" style={{ background:C.white,borderRadius:22,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 48px 120px rgba(27,46,75,0.28), 0 0 0 1px rgba(27,46,75,0.06)" }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg, ${C.navyD} 0%, ${C.navy} 60%, #2A3F60 100%)`, padding:"24px 28px 22px", flexShrink:0, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(184,150,90,0.12)" }} />
          <div style={{ position:"absolute", bottom:-30, left:40, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🔒</div>
              <div>
                <div style={{ fontFamily:T.display, fontSize:18, fontWeight:700, color:C.white, lineHeight:1.2 }}>NDA Express</div>
                <div style={{ fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>Accord de Confidentialité · Droit français</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0 }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px 28px" }}>
          {step === "form" && (
            <div className="fade-up">
              <div style={{ fontFamily:T.body, fontSize:12, color:C.textM, lineHeight:1.65, marginBottom:22, background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 16px" }}>
                🛡️ <strong style={{color:"#1E40AF"}}>Protégez vos idées avant d'envoyer votre brief.</strong> Ce NDA est généré par l'IA en 15 secondes et couvre toutes les obligations contractuelles françaises.
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:700, marginBottom:7 }}>PARTIE A — VOUS (divulgatrice)</label>
                <input style={inputStyle} value={partieA} onChange={e=>setPartieA(e.target.value)} placeholder="Votre nom ou raison sociale" onFocus={e=>e.target.style.borderColor=C.navy} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:700, marginBottom:7 }}>PARTIE B — LE DESTINATAIRE (réceptrice)</label>
                <input style={inputStyle} value={partieB} onChange={e=>setPartieB(e.target.value)} placeholder="Nom du client / partenaire" onFocus={e=>e.target.style.borderColor=C.navy} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:700, marginBottom:7 }}>OBJET / CONTEXTE DU PROJET</label>
                <textarea style={{ ...inputStyle, resize:"vertical", minHeight:80, lineHeight:1.6 }} value={objet} onChange={e=>setObjet(e.target.value)} placeholder="Ex : Développement d'une application mobile de e-commerce…" onFocus={e=>e.target.style.borderColor=C.navy} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>
              <button
                onClick={generate}
                disabled={!partieA.trim()||!partieB.trim()||!objet.trim()}
                style={{ width:"100%", padding:"15px", background:(!partieA.trim()||!partieB.trim()||!objet.trim()) ? C.creamDD : `linear-gradient(135deg, ${C.navyD} 0%, ${C.navy} 100%)`, color:(!partieA.trim()||!partieB.trim()||!objet.trim()) ? C.textL : C.white, border:"none", borderRadius:12, cursor:(!partieA.trim()||!partieB.trim()||!objet.trim()) ? "not-allowed" : "pointer", fontFamily:T.body, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:9, boxShadow:(!partieA.trim()||!partieB.trim()||!objet.trim()) ? "none" : "0 8px 28px #1B2E4B35", transition:"all 0.2s" }}
                onMouseOver={e=>{if(partieA.trim()&&partieB.trim()&&objet.trim()){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 12px 36px #1B2E4B45";}}}
                onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=(!partieA.trim()||!partieB.trim()||!objet.trim())?"none":"0 8px 28px #1B2E4B35";}}
              >
                <span style={{ fontSize:16 }}>🔒</span> Générer le NDA en 15 sec
              </button>
            </div>
          )}

          {step === "loading" && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ width:56, height:56, border:`3px solid ${C.creamDD}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 20px" }} />
              <div style={{ fontFamily:T.display, fontSize:18, color:C.navy, fontWeight:700, marginBottom:8 }}>Rédaction en cours{".".repeat(dots)}</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, lineHeight:1.7 }}>
                L'IA rédige votre NDA conforme au droit français…<br/>
                <span style={{ color:C.gold, fontWeight:600 }}>Article 1240 Code civil · 3 ans de protection</span>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="fade-up">
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"11px 16px" }}>
                <span style={{ fontSize:16 }}>✅</span>
                <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#166534" }}>NDA généré avec succès · Prêt à envoyer</div>
              </div>
              <div style={{ background:C.cream, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"20px 20px", maxHeight:320, overflowY:"auto", marginBottom:16 }}>
                <pre style={{ fontFamily:T.body, fontSize:11.5, color:C.text, lineHeight:1.75, whiteSpace:"pre-wrap", wordBreak:"break-word", margin:0 }}>{nda}</pre>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { setStep("form"); setNda(""); }} style={{ flex:1, padding:"12px", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:12, fontWeight:600, color:C.textM, transition:"all 0.15s" }} onMouseOver={e=>e.currentTarget.style.background=C.creamD} onMouseOut={e=>e.currentTarget.style.background=C.white}>← Modifier</button>
                <button onClick={copy} style={{ flex:2, padding:"12px", background: copying ? "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)" : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 5px 18px #1B2E4B30", transition:"all 0.2s" }}>
                  {copying ? <><span>✓</span> Copié !</> : <><span>📋</span> Copier le NDA</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ RECOUVREMENT FERME MODAL ══ */
function RecouvrementFermeModal({ onClose }) {
  /* ── State global ── */
  const [activeMode, setActiveMode] = useState(null); // null | "auto" | "manual"
  const [manualOpen, setManualOpen] = useState(false);

  /* ── State mode AUTO (Sophie Martin pré-rempli) ── */
  const AUTO_CASE = {
    clientName: "Sophie Martin",
    company: "TechStart SAS",
    mission: "Développement Web — Contrat CP-2026-3301",
    amount: "388",
    daysLate: 14,
    dueDate: "2026-05-27",
  };
  const [autoStep, setAutoStep]     = useState("alert"); // alert | loading | result
  const [autoLetter, setAutoLetter] = useState("");
  const [autoCopying, setAutoCopying] = useState(false);
  const [autoDots, setAutoDots]     = useState(1);

  /* ── State mode MANUEL ── */
  const [manDebtor,  setManDebtor]  = useState("");
  const [manAmount,  setManAmount]  = useState("");
  const [manDetails, setManDetails] = useState("");
  const [manStep,    setManStep]    = useState("form"); // form | loading | result
  const [manLetter,  setManLetter]  = useState("");
  const [manCopying, setManCopying] = useState(false);
  const [manDots,    setManDots]    = useState(1);

  /* ── State envoi mise en demeure ── */
  const [sendModal, setSendModal]   = useState(null); // null | { letter, clientName }
  const [sendSuccess, setSendSuccess] = useState(null); // null | clientName

  /* ── Dots animation ── */
  useEffect(() => {
    if (autoStep !== "loading") return;
    const id = setInterval(() => setAutoDots(d => d < 3 ? d+1 : 1), 500);
    return () => clearInterval(id);
  }, [autoStep]);
  useEffect(() => {
    if (manStep !== "loading") return;
    const id = setInterval(() => setManDots(d => d < 3 ? d+1 : 1), 500);
    return () => clearInterval(id);
  }, [manStep]);

  /* ── Génération IA ── */
  const buildPrompt = (debtor, amount, dueDate, mission, daysLate) => `Tu es un avocat spécialisé en recouvrement de créances en droit français. Rédige une MISE EN DEMEURE DE PAIEMENT ferme et juridiquement solide.

Débiteur : ${debtor}
Montant impayé HT : ${amount} €
Date d'échéance dépassée : ${dueDate}
Retard : ${daysLate} jours
Mission concernée : ${mission}
Date de la lettre : ${new Date().toLocaleDateString("fr-FR")}

La lettre doit :
1. Mentionner EXPLICITEMENT les articles L441-10 et L441-11 du Code de commerce (pénalités de retard légales)
2. Calculer les pénalités au taux BCE + 10 points appliquées au montant exact
3. Mentionner l'indemnité forfaitaire de 40 € pour frais de recouvrement (art. D441-5 C.com.)
4. Fixer un délai de 8 JOURS OUVRÉS pour régulariser sous peine de poursuites judiciaires
5. Mentionner le recours possible à l'injonction de payer (art. 1405 CPC) et au recouvrement par huissier
6. Ton ferme, professionnel, sans agressivité mais sans concession

Structure : Objet → Rappel des faits → Montant total dû avec calcul détaillé (capital + pénalités + 40€) → Mise en demeure formelle → Délai + conséquences → Formule de clôture

Commence DIRECTEMENT par "MISE EN DEMEURE DE PAIEMENT". Pas d'introduction.`;

  const callAI = async (prompt) => {
    const res = await fetch("/api/generate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:1200, messages:[{role:"user",content:prompt}] }),
    });
    const data = await res.json();
    return (data.content||[]).map(i=>i.text||"").join("\n").trim();
  };

  const generateAuto = async () => {
    setAutoStep("loading");
    try {
      const prompt = buildPrompt(
        `${AUTO_CASE.clientName} (${AUTO_CASE.company})`,
        AUTO_CASE.amount,
        AUTO_CASE.dueDate,
        AUTO_CASE.mission,
        AUTO_CASE.daysLate
      );
      const text = await callAI(prompt);
      setAutoLetter(text);
      setAutoStep("result");
    } catch {
      setAutoLetter("Erreur de génération. Vérifie ta connexion et réessaie.");
      setAutoStep("result");
    }
  };

  const generateManual = async () => {
    if (!manDebtor.trim() || !manAmount.trim()) return;
    setManStep("loading");
    try {
      const prompt = buildPrompt(manDebtor, manAmount, new Date().toLocaleDateString("fr-FR"), manDetails || "Mission freelance", "—");
      const text = await callAI(prompt);
      setManLetter(text);
      setManStep("result");
    } catch {
      setManLetter("Erreur de génération. Vérifie ta connexion et réessaie.");
      setManStep("result");
    }
  };

  /* ── Styles partagés ── */
  const inputStyle = {
    width:"100%", padding:"12px 15px",
    border:`1.5px solid ${C.border}`, borderRadius:10,
    fontSize:13, fontFamily:T.body, color:C.text, outline:"none",
    background:C.white, transition:"border-color 0.16s", boxSizing:"border-box",
  };
  const labelSt = { display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:700, marginBottom:7 };

  /* ── Loading screen shared ── */
  const LoadingScreen = ({ dots }) => (
    <div style={{ textAlign:"center", padding:"36px 0" }}>
      <div style={{ width:52, height:52, border:"3px solid #FEE2E2", borderTopColor:"#DC2626", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 18px" }} />
      <div style={{ fontFamily:T.display, fontSize:17, color:"#7F1D1D", fontWeight:700, marginBottom:8 }}>Rédaction en cours{".".repeat(dots)}</div>
      <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, lineHeight:1.7 }}>
        Calcul des pénalités de retard…<br/>
        <span style={{ color:"#DC2626", fontWeight:600 }}>Art. L441-10 · L441-11 · D441-5 C.com.</span>
      </div>
    </div>
  );

  /* ── Result screen shared ── */
  const ResultScreen = ({ letter, onEdit, clientName }) => (
    <div className="fade-up">
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:"11px 16px" }}>
        <span>🚨</span>
        <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#991B1B" }}>Mise en demeure prête · Pénalités de retard calculées</div>
      </div>
      <div style={{ background:C.cream, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"18px 20px", maxHeight:260, overflowY:"auto", marginBottom:14 }}>
        <pre style={{ fontFamily:T.body, fontSize:11.5, color:C.text, lineHeight:1.75, whiteSpace:"pre-wrap", wordBreak:"break-word", margin:0 }}>{letter}</pre>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onEdit} style={{ flex:1, padding:"12px", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:12, fontWeight:600, color:C.textM }} onMouseOver={e=>e.currentTarget.style.background=C.creamD} onMouseOut={e=>e.currentTarget.style.background=C.white}>← Modifier</button>
        <button
          onClick={() => setSendModal({ letter, clientName: clientName || AUTO_CASE.clientName })}
          style={{ flex:2, padding:"12px", background:"linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 5px 18px rgba(185,28,28,0.3)", transition:"all 0.2s" }}
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(185,28,28,0.45)";}}
          onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 5px 18px rgba(185,28,28,0.3)";}}
        >
          <span style={{ fontSize:16 }}>✉️</span> Envoyer la mise en demeure
        </button>
      </div>

      {/* ── Modal choix du canal d'envoi ── */}
      {sendModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSendModal(null); }}
          style={{ position:"fixed", inset:0, background:"rgba(10,18,32,0.75)", zIndex:20000, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", backdropFilter:"blur(8px)" }}
        >
          {sendSuccess ? (
            /* ── Écran confirmation succès ── */
            <div className="fade-up" style={{ background:C.white, borderRadius:20, padding:"24px 16px", maxWidth:400, width:"100%", textAlign:"center", boxShadow:"0 40px 100px rgba(0,0,0,0.35)", border:"1px solid #BBF7D0" }}>
              <div style={{ width:64, height:64, background:"linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 18px" }}>🚀</div>
              <div style={{ fontFamily:T.display, fontSize:20, fontWeight:700, color:"#065F46", marginBottom:10, lineHeight:1.3 }}>Notification officielle envoyée avec succès à {sendSuccess}.</div>
              <div style={{ fontFamily:T.body, fontSize:13, color:"#047857", marginBottom:24, lineHeight:1.65 }}>Le dossier est mis à jour.</div>
              <button
                onClick={() => { setSendSuccess(null); setSendModal(null); }}
                style={{ padding:"12px 32px", background:"linear-gradient(135deg, #065F46 0%, #059669 100%)", color:"#fff", border:"none", borderRadius:50, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:700, boxShadow:"0 6px 20px rgba(5,150,105,0.4)" }}
              >Fermer le dossier ✓</button>
            </div>
          ) : (
            /* ── Écran choix du canal ── */
            <div className="fade-up" style={{ background:C.white, borderRadius:20, padding:"30px 28px", maxWidth:420, width:"100%", boxShadow:"0 40px 100px rgba(0,0,0,0.35)", border:`1px solid ${C.border}` }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
                <div>
                  <div style={{ fontFamily:T.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:3 }}>Choisir le canal d'envoi</div>
                  <div style={{ fontFamily:T.body, fontSize:12, color:C.textL }}>Envoi officiel à <strong style={{ color:C.navy }}>{sendModal.clientName}</strong></div>
                </div>
                <button onClick={() => setSendModal(null)} style={{ width:30, height:30, borderRadius:"50%", background:C.creamD, border:"none", cursor:"pointer", color:C.textM, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              </div>

              {/* Option Email */}
              <button
                onClick={() => {
                  const subject = `Mise en demeure de paiement — ${sendModal.clientName}`;
                  const body = sendModal.letter || "";
                  const to = sendModal.clientEmail || "";
                  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  setSendSuccess(sendModal.clientName);
                }}
                style={{ width:"100%", padding:"18px 20px", background:"linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", border:"1.5px solid #93C5FD", borderRadius:14, cursor:"pointer", marginBottom:12, textAlign:"left", transition:"all 0.2s" }}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(59,130,246,0.25)";}}
                onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
              >
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, background:"linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📧</div>
                  <div>
                    <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:"#1E3A8A", marginBottom:3 }}>Par Email</div>
                    <div style={{ fontFamily:T.body, fontSize:11.5, color:"#3B82F6", lineHeight:1.55 }}>Ouvre ton application email avec la mise en demeure déjà rédigée, prête à envoyer à {sendModal.clientName}.</div>
                  </div>
                </div>
              </button>

              {/* Option SMS */}
              <button
                onClick={() => {
                  const msg = `Bonjour ${sendModal.clientName}, une mise en demeure de paiement vous a été adressée concernant une facture en retard. Merci de régulariser rapidement. Cordialement.`;
                  window.location.href = `sms:${sendModal.clientPhone || ""}?body=${encodeURIComponent(msg)}`;
                  setSendSuccess(sendModal.clientName);
                }}
                style={{ width:"100%", padding:"18px 20px", background:"linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border:"1.5px solid #86EFAC", borderRadius:14, cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(34,197,94,0.25)";}}
                onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
              >
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, background:"linear-gradient(135deg, #15803D 0%, #22C55E 100%)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💬</div>
                  <div>
                    <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:"#14532D", marginBottom:3 }}>Par SMS</div>
                    <div style={{ fontFamily:T.body, fontSize:11.5, color:"#16A34A", lineHeight:1.55 }}>Ouvre ton application de messages avec un rappel factuel prêt à envoyer à {sendModal.clientName}.</div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(10,18,32,0.80)", zIndex:10100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(10px)" }}
    >
      <div className="fade-up" style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:540, maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 48px 120px rgba(120,20,20,0.22), 0 0 0 1px rgba(150,30,30,0.08)" }}>

        {/* ── HEADER ── */}
        <div style={{ background:"linear-gradient(135deg, #7F1D1D 0%, #B91C1C 60%, #DC2626 100%)", padding:"22px 26px 20px", flexShrink:0, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:13 }}>
              <div style={{ width:42, height:42, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🚨</div>
              <div>
                <div style={{ fontFamily:T.display, fontSize:17, fontWeight:700, color:"#fff", lineHeight:1.2 }}>Recouvrement Ferme</div>
                <div style={{ fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>Mise en demeure · Art. L441-10 C.com.</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", cursor:"pointer", color:"rgba(255,255,255,0.75)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"22px 26px 26px" }}>

          {/* ════ BLOC 1 — MODE AUTOMATIQUE ════ */}
          <div className="fade-up" style={{ marginBottom:16 }}>
            {/* Alerte prioritaire */}
            <div style={{ background:"linear-gradient(135deg, #FFF1F2 0%, #FEF2F2 100%)", border:"1.5px solid #FECACA", borderRadius:14, padding:"16px 18px", marginBottom: autoStep !== "alert" ? 14 : 0 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                <div style={{ width:36, height:36, background:"#FEE2E2", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⏳</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <div style={{ fontFamily:T.body, fontSize:13, fontWeight:800, color:"#991B1B" }}>Exemple de relance</div>
                    <span style={{ fontFamily:T.body, fontSize:9, fontWeight:700, color:"#92400E", background:"#FEF3C7", border:"1px solid #FCD34D", borderRadius:5, padding:"1px 6px", letterSpacing:"0.05em" }}>DÉMO</span>
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:12, color:"#7F1D1D", lineHeight:1.6 }}>
                    <strong>{AUTO_CASE.clientName}</strong> ({AUTO_CASE.company}) — Facture finale de <strong>{AUTO_CASE.amount} € HT</strong> en retard de <strong>{AUTO_CASE.daysLate} jours</strong>. <em>Teste la génération sur ce cas, ou saisis ton vrai dossier plus bas.</em>
                  </div>
                </div>
              </div>
              {/* Détails mission */}
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.7)", borderRadius:8, padding:"8px 12px", marginBottom:12, border:"1px solid #FECACA" }}>
                <span style={{ fontSize:13 }}>📋</span>
                <div style={{ fontFamily:T.body, fontSize:11.5, color:"#7F1D1D", fontWeight:500 }}>{AUTO_CASE.mission}</div>
              </div>
              {/* Bouton génération auto */}
              {autoStep === "alert" && (
                <button
                  onClick={generateAuto}
                  style={{ width:"100%", padding:"13px 16px", background:"linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)", color:"#fff", border:"none", borderRadius:11, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:9, boxShadow:"0 6px 24px rgba(185,28,28,0.45)", transition:"all 0.2s", letterSpacing:"0.02em" }}
                  onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(185,28,28,0.55)";}}
                  onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 24px rgba(185,28,28,0.45)";}}
                >
                  <span style={{ fontSize:16 }}>⚡</span> Générer la mise en demeure IA
                </button>
              )}
            </div>

            {/* Loading / Résultat mode auto */}
            {autoStep === "loading" && <LoadingScreen dots={autoDots} />}
            {autoStep === "result" && (
              <ResultScreen
                letter={autoLetter}
                onEdit={() => { setAutoStep("alert"); setAutoLetter(""); }}
                clientName={AUTO_CASE.clientName}
              />
            )}
          </div>

          {/* ════ SÉPARATEUR ════ */}
          {autoStep !== "loading" && (
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 14px" }}>
              <div style={{ flex:1, height:1, background:C.border }} />
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:700, whiteSpace:"nowrap" }}>OU</div>
              <div style={{ flex:1, height:1, background:C.border }} />
            </div>
          )}

          {/* ════ BLOC 2 — MODE MANUEL (accordéon) ════ */}
          {autoStep !== "loading" && (
            <div className="fade-up fade-up-2">
              {/* Toggle accordéon */}
              <button
                onClick={() => setManualOpen(o => !o)}
                style={{ width:"100%", padding:"13px 16px", background: manualOpen ? C.creamD : C.white, border:`1.5px solid ${manualOpen ? C.border : C.borderL}`, borderRadius: manualOpen ? "13px 13px 0 0" : 13, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.2s" }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ fontSize:16 }}>✍️</span>
                  <span>Saisie manuelle (Autre dossier)</span>
                </div>
                <span style={{ fontSize:14, color:C.textL, transform: manualOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
              </button>

              {/* Contenu accordéon */}
              {manualOpen && (
                <div className="fade-up" style={{ background:C.white, border:`1.5px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 13px 13px", padding:"18px 18px 20px" }}>
                  {manStep === "form" && (
                    <>
                      <div style={{ marginBottom:12 }}>
                        <label style={labelSt}>NOM DU CLIENT</label>
                        <input style={inputStyle} value={manDebtor} onChange={e=>setManDebtor(e.target.value)} placeholder="Ex : Pierre Durand / Agence Nova" onFocus={e=>e.target.style.borderColor="#DC2626"} onBlur={e=>e.target.style.borderColor=C.border} />
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={labelSt}>MONTANT DÛ (€ HT)</label>
                        <input type="number" style={inputStyle} value={manAmount} onChange={e=>setManAmount(e.target.value)} placeholder="Ex : 1 500" onFocus={e=>e.target.style.borderColor="#DC2626"} onBlur={e=>e.target.style.borderColor=C.border} />
                      </div>
                      <div style={{ marginBottom:18 }}>
                        <label style={labelSt}>DÉTAILS OU HISTORIQUE DU LITIGE</label>
                        <textarea
                          value={manDetails}
                          onChange={e=>setManDetails(e.target.value)}
                          placeholder="Ex : Facture n°2026-08 émise le 10/04. Deux relances sans réponse. Mission de refonte site web."
                          rows={3}
                          style={{ ...inputStyle, resize:"vertical", lineHeight:1.6, minHeight:80 }}
                          onFocus={e=>e.target.style.borderColor="#DC2626"}
                          onBlur={e=>e.target.style.borderColor=C.border}
                        />
                      </div>
                      <button
                        onClick={generateManual}
                        disabled={!manDebtor.trim() || !manAmount.trim()}
                        style={{ width:"100%", padding:"13px", background:(!manDebtor.trim()||!manAmount.trim()) ? C.creamDD : "linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)", color:(!manDebtor.trim()||!manAmount.trim()) ? C.textL : "#fff", border:"none", borderRadius:11, cursor:(!manDebtor.trim()||!manAmount.trim()) ? "not-allowed" : "pointer", fontFamily:T.body, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:(!manDebtor.trim()||!manAmount.trim()) ? "none" : "0 6px 22px rgba(185,28,28,0.4)", transition:"all 0.2s" }}
                      >
                        <span>🚨</span> Générer
                      </button>
                    </>
                  )}
                  {manStep === "loading" && <LoadingScreen dots={manDots} />}
                  {manStep === "result" && (
                    <ResultScreen
                      letter={manLetter}
                      onEdit={() => { setManStep("form"); setManLetter(""); }}
                      clientName={manDebtor}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Note informative */}
          <div style={{ marginTop:18, fontFamily:T.body, fontSize:10.5, color:C.textL, lineHeight:1.65, textAlign:"center", padding:"0 8px" }}>
            Cette mise en demeure s'appuie sur les articles L441-10, L441-11 et D441-5 du Code de commerce.<br/>
            <span style={{ color:"#991B1B", fontWeight:600 }}>Indemnité forfaitaire de 40€ + pénalités BCE + 10 pts.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordForm({ onSuccess }) {
  const [pwd, setPwd] = React.useState("");
  const [pwd2, setPwd2] = React.useState("");
  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const handle = async () => {
    if (pwd.length < 6) { setError("6 caractères min."); return; }
    if (pwd !== pwd2) { setError("Mots de passe différents"); return; }
    setLoading(true);
    const { error: e } = await supabase.auth.updateUser({ password: pwd });
    if (e) { setError(e.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => onSuccess(), 2000);
  };
  if (done) return React.createElement("p", { style: { color:"#2D6A4F" } }, "Mot de passe mis a jour !");
  const s = { width:"100%", padding:"14px 44px 14px 16px", border:"1.5px solid #D8D4CB", borderRadius:12, fontSize:14, marginBottom:12, boxSizing:"border-box" };
  const eyeBtn = (show, setShow) => React.createElement("button", { type:"button", onClick:()=>setShow(!show), style:{ position:"absolute", right:12, top:"50%", transform:"translateY(-60%)", background:"none", border:"none", cursor:"pointer", color:"#8A8780", fontSize:14, padding:0 } }, show ? "masquer" : "voir");
  return React.createElement("div", null,
    React.createElement("div", { style:{ position:"relative", marginBottom:0 } },
      React.createElement("input", { type:show1?"text":"password", placeholder:"Nouveau mot de passe", value:pwd, onChange:e=>setPwd(e.target.value), style:s }),
      eyeBtn(show1, setShow1)
    ),
    React.createElement("div", { style:{ position:"relative", marginBottom:0 } },
      React.createElement("input", { type:show2?"text":"password", placeholder:"Confirmer le mot de passe", value:pwd2, onChange:e=>setPwd2(e.target.value), style:s }),
      eyeBtn(show2, setShow2)
    ),
    error && React.createElement("p", { style:{ color:"#C0392B", fontSize:12, marginBottom:12 } }, error),
    React.createElement("button", { onClick:handle, disabled:loading, style:{ width:"100%", padding:"14px", background:"#1B2E4B", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" } }, loading ? "..." : "Enregistrer")
  );
}

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [showPwd2, setShowPwd2]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState(""); // "google" | "linkedin" | ""
  const [error, setError]         = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Saisis une adresse email valide.");
      return;
    }
    if (!password || password.length < 6) { setError("Mot de passe trop court (6 caractères min.)"); return; }
    if (mode === "signup" && confirmPwd !== password) { setError("Les mots de passe ne correspondent pas"); return; }
    setError(""); setLoading(true);
    try {
      let data, error;
      if (mode === "signup") {
        const res = await supabase.auth.signUp({ email: email.trim(), password });
        data = res.data; error = res.error;
      } else {
        const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        data = res.data; error = res.error;
      }
      if (error) { setError(error.message); setLoading(false); return; }
      if (data?.user) { setLoading(false); onSuccess(data.user); }
      else { setError("Erreur connexion"); setLoading(false); }








    } catch(e) {
      setError("Erreur réseau"); setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      // Sauvegarder form dans IndexedDB avant redirect Google
      await new Promise((resolve) => {
        try {
          const getCookie = (name) => {
            const c = document.cookie.split("; ").find(r=>r.startsWith(name+"="));
            return c ? decodeURIComponent(c.split("=")[1]) : "";
          };
          const formData = getCookie("freeley_pending_form");
          const stepData = getCookie("freeley_pending_step");
          const req = indexedDB.open("freeley_db", 2);
          req.onupgradeneeded = e => e.target.result.createObjectStore("pending");
          req.onsuccess = e => {
            const db = e.target.result;
            const tx = db.transaction("pending", "readwrite");
            const store = tx.objectStore("pending");
            store.put(formData || "", "form");
            store.put(stepData || "0", "step");
            tx.oncomplete = () => resolve();
          };
          req.onerror = () => resolve();
        } catch(e) { resolve(); }
      });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "linkedin" ? "linkedin_oidc" : provider,
        options: {
          redirectTo: window.location.origin + (localStorage.getItem("freeley_scan_pending") === "1" ? "?from=scanner" : ""),
        },
      });
      if (error) { setError(error.message); setOauthLoading(""); }
    } catch(e) {
      setError("Erreur connexion"); setOauthLoading("");
    }
  };

  const inputBase = {
    width:"100%", padding:"14px 16px",
    border:`1.5px solid ${C.border}`, borderRadius:12,
    fontSize:14, fontFamily:T.body, color:C.text, outline:"none",
    boxSizing:"border-box", background:C.white,
    transition:"border-color 0.18s, box-shadow 0.18s",
  };

  const oauthBtn = {
    width:"100%", padding:"14px 20px",
    background:C.white, border:`1.5px solid ${C.border}`,
    borderRadius:14, cursor:"pointer",
    fontFamily:T.body, fontSize:14, fontWeight:600, color:C.text,
    display:"flex", alignItems:"center", justifyContent:"center", gap:12,
    transition:"all 0.18s",
    boxSizing:"border-box",
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(12,22,38,0.72)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:24, width:"100%", maxWidth:432,
        boxShadow:"0 40px 100px rgba(27,46,75,0.22), 0 0 0 1px rgba(27,46,75,0.06)",
        overflow:"hidden", position:"relative",
      }}>

        {/* ── Bande déco haut ── */}
        <div style={{ height:4, background:`linear-gradient(90deg, ${C.navy} 0%, ${C.gold} 50%, ${C.navy} 100%)`, backgroundSize:"200% 100%", animation:"magicShimmer 3s linear infinite" }} />

        {/* ── Bouton fermer ── */}
        <button
          onClick={onClose}
          style={{ position:"absolute", top:20, right:20, width:32, height:32, borderRadius:"50%", background:C.creamD, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:C.textL, lineHeight:1, transition:"all 0.15s" }}
          onMouseOver={e => { e.currentTarget.style.background = C.creamDD; e.currentTarget.style.color = C.navy; }}
          onMouseOut={e => { e.currentTarget.style.background = C.creamD; e.currentTarget.style.color = C.textL; }}
        >×</button>

        <div style={{ padding:"32px 36px 0" }}>

          {/* ── Logo ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
            <img src={FREELEY_LOGO} alt="Freeley" style={{ height:36, width:"auto", objectFit:"contain" }} />
            <span style={{ fontFamily:T.display, fontSize:17, color:C.navy, fontWeight:600, letterSpacing:"-0.01em" }}>Freeley</span>
          </div>

          {magicSent ? (
            /* ── État : lien envoyé ── */
            <div style={{ textAlign:"center", paddingBottom:36 }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", border:"2px solid #6EE7B7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>📬</div>
              <div style={{ fontFamily:T.display, fontSize:22, color:C.navy, fontWeight:700, marginBottom:8, lineHeight:1.2 }}>Lien envoyé !</div>
              <p style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.7, marginBottom:8 }}>
                Vérifie ta boîte mail à <strong style={{ color:C.navy }}>{email}</strong>.<br/>
                Clique sur le lien pour accéder à ton espace en un instant.
              </p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:T.body, fontSize:12, color:C.textL }}>
                <span style={{ width:14, height:14, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.9s linear infinite" }} />
                Connexion automatique en cours…
              </div>
            </div>
          ) : (
            <>
              {/* ── Titre ── */}
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontFamily:T.display, fontSize:24, color:C.navy, fontWeight:700, marginBottom:6, lineHeight:1.2 }}>
                  {mode === "signup" ? "Créez votre compte Freeley 🛡️" : "Bon retour parmi nous 👋"}
                </h2>
                <p style={{ fontFamily:T.body, fontSize:13, color:C.textL, lineHeight:1.65, margin:0 }}>
                  {mode === "signup" ? "Rejoignez les freelances qui protègent leurs missions avec Freeley." : "Connectez-vous pour accéder à vos contrats."}
                </p>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                <button onClick={() => setMode("login")} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${mode === "login" ? C.navy : C.border}`, background: mode === "login" ? C.navy : "white", color: mode === "login" ? "white" : C.textM, fontFamily:T.body, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  Se connecter
                </button>
                <button onClick={() => setMode("signup")} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${mode === "signup" ? C.navy : C.border}`, background: mode === "signup" ? C.navy : "white", color: mode === "signup" ? "white" : C.textM, fontFamily:T.body, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  Créer un compte
                </button>
              </div>

              {/* ── OAuth Google ── */}
              <button
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                style={{ ...oauthBtn, marginBottom:10 }}
                onMouseOver={e => { if (!oauthLoading) { e.currentTarget.style.borderColor = C.navy+"55"; e.currentTarget.style.background = C.cream; e.currentTarget.style.boxShadow = "0 4px 16px #1B2E4B0E"; }}}
                onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; e.currentTarget.style.boxShadow = "none"; }}
              >
                {oauthLoading === "google" ? (
                  <span style={{ width:18, height:18, border:`2px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>🌐 Continuer avec Google</span>
              </button>

              {/* ── OAuth LinkedIn ── */}
              <button
                onClick={() => handleOAuth("linkedin")}
                disabled={!!oauthLoading}
                style={{ ...oauthBtn, marginBottom:10 }}
                onMouseOver={e => { if (!oauthLoading) { e.currentTarget.style.borderColor = "#0077B555"; e.currentTarget.style.background = "#F0F7FF"; e.currentTarget.style.boxShadow = "0 4px 16px #0077B510"; }}}
                onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; e.currentTarget.style.boxShadow = "none"; }}
              >
                {oauthLoading === "linkedin" ? (
                  <span style={{ width:18, height:18, border:`2px solid #0077B540`, borderTopColor:"#0077B5", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                <span>💼 Continuer avec LinkedIn</span>
              </button>



              {/* ── Séparateur ── */}
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
                <div style={{ flex:1, height:1, background:C.border }} />
                <span style={{ fontFamily:T.body, fontSize:11, color:C.textL, fontWeight:600, letterSpacing:"0.1em", whiteSpace:"nowrap" }}>ou par email</span>
                <div style={{ flex:1, height:1, background:C.border }} />
              </div>

              {/* ── Email + Password ── */}
              <div style={{ marginBottom:12 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="Votre adresse email pro"
                  onKeyDown={e => e.key === "Enter" && handleMagicLink()}
                  style={inputBase}
                  onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = "0 0 0 3px #1B2E4B12"; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ marginBottom:12, position:"relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password || ""}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Mot de passe (6 caractères min.)"
                  onKeyDown={e => e.key === "Enter" && handleMagicLink()}
                  style={{ ...inputBase, paddingRight:44 }}
                  onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = "0 0 0 3px #1B2E4B12"; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:14, padding:0 }}>voir</button>
              </div>
              {mode === "signup" && (
              <div style={{ marginBottom:12, position:"relative" }}>
                <input
                  type={showPwd2 ? "text" : "password"}
                  value={confirmPwd || ""}
                  onChange={e => { setConfirmPwd(e.target.value); setError(""); }}
                  placeholder="Confirmer le mot de passe"
                  onKeyDown={e => e.key === "Enter" && handleMagicLink()}
                  style={{ ...inputBase, paddingRight:44 }}
                  onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = "0 0 0 3px #1B2E4B12"; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPwd2(!showPwd2)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:14, padding:0 }}>voir</button>
              </div>
              )}

              {error && (
                <div style={{ padding:"9px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, color:C.error, fontSize:12, fontFamily:T.body, marginBottom:12 }}>
                  ⚠ {error}
                </div>
              )}

              <button
                onClick={handleMagicLink}
                disabled={loading || !email.trim()}
                style={{
                  width:"100%", padding:"14px 20px",
                  background: loading || !email.trim()
                    ? C.creamDD
                    : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
                  color: loading || !email.trim() ? C.textL : C.white,
                  border:"none", borderRadius:14,
                  cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  fontFamily:T.body, fontSize:14, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                  boxShadow: loading || !email.trim() ? "none" : "0 8px 28px #1B2E4B30",
                  transition:"all 0.2s",
                  marginBottom:10,
                  boxSizing:"border-box",
                }}
                onMouseOver={e => { if (!loading && email.trim()) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 36px #1B2E4B40"; }}}
                onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading || !email.trim() ? "none" : "0 8px 28px #1B2E4B30"; }}
              >
                {loading ? (
                  <><span style={{ width:15, height:15, border:`2px solid rgba(255,255,255,0.4)`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Envoi en cours…</>
                ) : (
                  <><span>✨</span> Recevoir mon lien magique de connexion</>
                )}
              </button>

              {mode === "login" && (
                <p style={{ fontFamily:T.body, fontSize:12, color:C.textL, textAlign:"center", lineHeight:1.6, margin:"8px 0 0" }}>
                  <span onClick={async () => {
                    if (!email.trim()) { setError("Entre ton email d'abord"); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: "https://freeley-ten.vercel.app" });
                    if (error) setError(error.message);
                    else setError("Email de réinitialisation envoyé ! Vérifie ta boite mail.");
                  }} style={{ cursor:"pointer", color:C.navy, textDecoration:"underline", fontWeight:500 }}>
                    Mot de passe oublié ?
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Bandeau points forts ── */}
        {!magicSent && (
          <div style={{
            margin:"20px 0 0",
            background:`linear-gradient(135deg, ${C.cream} 0%, #FFF9EE 100%)`,
            borderTop:`1px solid ${C.border}`,
            padding:"14px 36px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:0,
            flexWrap:"wrap",
          }}>
            {[
              { icon:"📦", text:"Essai inclus : 2 contrats gratuits" },
              { icon:"🪄", text:"Scanner IA intégré" },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ width:1, height:16, background:C.border, margin:"0 16px", flexShrink:0 }} />}
                <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:T.body, fontSize:11, color:C.textM, fontWeight:600, whiteSpace:"nowrap" }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  {item.text}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MagicPhotoSectionTitle({ num, title, sub, delay=1, onMagicFill, loading, success, successMsg, tooltipText, successStyle="green" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  const isGold = successStyle === "gold";

  return (
    <div className={`fade-up fade-up-${delay}`} style={{ marginBottom: success ? 16 : 32 }}>
      <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.2em", color:C.gold, fontWeight:600, marginBottom:6 }}>ÉTAPE {num}</div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <h2 style={{ fontFamily:T.display, fontSize:28, color:C.navy, fontWeight:600, margin:0 }}>{title}</h2>

        {/* ✨📷 Mini camera icon */}
        <div ref={tooltipRef} style={{ position:"relative", display:"flex", alignItems:"center", gap:5 }}>
          <button
            onClick={onMagicFill}
            disabled={loading}
            title="Pré-remplir par photo"
            style={{
              display:"flex", alignItems:"center", gap:3,
              background: loading ? "#E8EFF7" : "linear-gradient(135deg, #F0F4FA 0%, #E8EFF7 100%)",
              border:`1px solid ${loading ? C.border : "#C8D8EF"}`,
              borderRadius:20, padding:"4px 9px 4px 6px",
              cursor: loading ? "default" : "pointer",
              fontFamily:T.body, fontSize:11.5, fontWeight:600,
              color: loading ? C.textL : C.navy,
              transition:"all 0.18s",
              boxShadow: loading ? "none" : "0 1px 4px #1B2E4B12",
              flexShrink:0,
            }}
            onMouseOver={e=>{ if(!loading){ e.currentTarget.style.background="linear-gradient(135deg, #E2EAF6 0%, #D6E1F2 100%)"; e.currentTarget.style.boxShadow="0 2px 8px #1B2E4B20"; e.currentTarget.style.transform="translateY(-1px)"; }}}
            onMouseOut={e=>{ if(!loading){ e.currentTarget.style.background="linear-gradient(135deg, #F0F4FA 0%, #E8EFF7 100%)"; e.currentTarget.style.boxShadow="0 1px 4px #1B2E4B12"; e.currentTarget.style.transform="translateY(0)"; }}}
          >
            {loading ? (
              <>
                <div style={{ width:11, height:11, border:"1.5px solid #C8D8EF", borderTopColor:C.navy, borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
                <span style={{ fontSize:10 }}>IA…</span>
              </>
            ) : (
              <>
                <span style={{ fontSize:13, lineHeight:1 }}>✨</span>
                <span style={{ fontSize:13, lineHeight:1 }}>📷</span>
              </>
            )}
          </button>

          {/* Info tooltip button */}
          <button
            onClick={() => setShowTooltip(v => !v)}
            style={{
              width:18, height:18, borderRadius:"50%",
              background: showTooltip ? C.navy : C.creamD,
              border:`1px solid ${showTooltip ? C.navy : C.border}`,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:T.body, fontSize:9, fontWeight:700,
              color: showTooltip ? C.white : C.textL,
              flexShrink:0, transition:"all 0.15s", padding:0,
            }}
          >i</button>

          {/* Tooltip popover */}
          {showTooltip && (
            <div className="fade-up" style={{
              position:"absolute", top:"calc(100% + 8px)", left:0,
              zIndex:500,
              background:C.white,
              border:`1px solid ${C.border}`,
              borderRadius:10,
              padding:"12px 14px",
              boxShadow:"0 8px 28px #1B2E4B18",
              maxWidth:260, minWidth:220,
              animation:"fadeUp 0.2s cubic-bezier(.22,.68,0,1.2) both",
            }}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:14, flexShrink:0 }}>✨</span>
                <p style={{ fontFamily:T.body, fontSize:11.5, color:C.textM, lineHeight:1.6, margin:0 }}>
                  {tooltipText}
                </p>
              </div>
              {/* Small arrow */}
              <div style={{ position:"absolute", top:-5, left:14, width:8, height:8, background:C.white, border:`1px solid ${C.border}`, borderBottom:"none", borderRight:"none", transform:"rotate(45deg)" }} />
            </div>
          )}
        </div>
      </div>
      <p style={{ fontFamily:T.body, color:C.textL, fontSize:13, margin:"6px 0 0" }}>{sub}</p>

      {/* Toast succès inline */}
      {success && (
        <div className="fade-up" style={{
          marginTop:14, display:"flex", alignItems:"center", gap:10,
          background: isGold ? "linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)" : "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)",
          border:`1.5px solid ${isGold ? "#FCD34D" : "#86EFAC"}`,
          borderRadius:10, padding:"10px 14px",
          animation:"fadeUp 0.35s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <span style={{ fontSize:16, flexShrink:0 }}>✨</span>
          <div style={{ fontFamily:T.body, fontSize:12.5, fontWeight:700, color: isGold ? "#92400E" : "#15803D" }}>
            {successMsg}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ num, title, sub, delay=1 }) {
  return (
    <div className={`fade-up fade-up-${delay}`} style={{ marginBottom:32 }}>
      <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.2em", color:C.gold, fontWeight:600, marginBottom:6 }}>ÉTAPE {num}</div>
      <h2 style={{ fontFamily:T.display, fontSize:28, color:C.navy, fontWeight:600, margin:"0 0 6px" }}>{title}</h2>
      <p style={{ fontFamily:T.body, color:C.textL, fontSize:13, margin:0 }}>{sub}</p>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, margin:"32px 0 28px" }}>
      <div style={{ flex:1, height:1, background:C.border }} />
      <span style={{ fontFamily:T.body, fontSize:10, color:C.gold, fontWeight:600, letterSpacing:"0.15em", whiteSpace:"nowrap" }}>{label.toUpperCase()}</span>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type="text", error, delay, prefix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={delay ? `fade-up fade-up-${delay}` : ""} style={{ marginBottom: error ? 6 : 20 }}>
      <label style={{ display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:6 }}>{label.toUpperCase()}</label>
      <div style={{ position:"relative" }}>
        {prefix && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontFamily:T.body, color:C.textL, fontSize:14 }}>{prefix}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{
            width:"100%", padding: prefix ? "12px 14px 12px 28px" : "12px 14px",
            background: focused ? C.white : C.white,
            border:`1.5px solid ${error ? C.error : focused ? C.navy : C.border}`,
            borderRadius:8, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box",
            fontFamily:T.body, transition:"border-color 0.18s",
            boxShadow: focused ? `0 0 0 3px #1B2E4B10` : "none",
          }}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
      </div>
      {error && <p style={{ fontFamily:T.body, color:C.error, fontSize:11, margin:"5px 0 10px" }}>⚠ {error}</p>}
    </div>
  );
}

function FieldArea({ label, value, onChange, placeholder, error, delay }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={delay ? `fade-up fade-up-${delay}` : ""} style={{ marginBottom: error ? 6 : 20 }}>
      <label style={{ display:"block", fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:6 }}>{label.toUpperCase()}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4}
        style={{
          width:"100%", padding:"12px 14px", background:C.white,
          border:`1.5px solid ${error ? C.error : focused ? C.navy : C.border}`,
          borderRadius:8, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box",
          resize:"vertical", fontFamily:T.body, transition:"border-color 0.18s",
          boxShadow: focused ? `0 0 0 3px #1B2E4B10` : "none",
        }}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
      {error && <p style={{ fontFamily:T.body, color:C.error, fontSize:11, margin:"5px 0 10px" }}>⚠ {error}</p>}
    </div>
  );
}

function DescriptionField({ value, onChange, error, missionTitle }) {
  const [focused, setFocused] = useState(false);
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [improved, setImproved] = useState(false);
  const [previousValue, setPreviousValue] = useState("");

  const len = value.trim().length;
  const quality = len === 0 ? null : len < 60 ? "faible" : len < 150 ? "moyenne" : "bonne";
  const qualityColor = quality === "bonne" ? "#16A34A" : quality === "moyenne" ? "#D97706" : "#DC2626";
  const qualityBg = quality === "bonne" ? "#F0FDF4" : quality === "moyenne" ? "#FFFBEB" : "#FEF2F2";
  const qualityBorder = quality === "bonne" ? "#BBF7D0" : quality === "moyenne" ? "#FDE68A" : "#FECACA";
  const qualityLabel = quality === "bonne" ? "✓ Bonne description — contrat précis garanti" : quality === "moyenne" ? "⚡ Ajoute plus de détails pour un contrat plus solide" : "⚠ Description trop courte — ton contrat sera vague";

  const canImprove = len >= 20 && !improving;

  const handleImprove = async () => {
    if (!canImprove) return;
    setImproving(true);
    setImproveError("");
    setImproved(false);
    setPreviousValue(value);
    try {
      const prompt = `Tu es un expert en rédaction de contrats freelance français.
Un freelance a décrit sa mission ainsi :
---
${missionTitle ? `Titre : ${missionTitle}\n` : ""}Description : ${value}
---
Réécris et enrichis cette description pour qu'elle soit parfaitement adaptée à un contrat de prestation de services professionnel.

Règles impératives :
- Garde fidèlement le sens et le contexte d'origine, n'invente rien
- Détaille les livrables précis (nombre, format, technologie si mentionnée)
- Ajoute une section "Non inclus :" si elle n'existe pas déjà, avec les exclusions logiques
- Mentionne les jalons ou délais intermédiaires si pertinent
- Reste concis : 80 à 180 mots maximum
- Écris en prose directe, sans tirets ni bullet points, sans introduction ni conclusion
- Ne commence pas par "Cette mission" ou "Le prestataire"

Réponds uniquement avec la description réécrite, sans guillemets ni formatage.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(i => i.text || "").join("").trim();
      if (!text) throw new Error("Réponse vide");
      onChange(text);
      setImproved(true);
      setTimeout(() => setImproved(false), 4000);
    } catch {
      setImproveError("Erreur lors de l'amélioration. Réessaie.");
    }
    setImproving(false);
  };

  const handleUndo = () => {
    onChange(previousValue);
    setPreviousValue("");
    setImproved(false);
  };

  return (
    <div className="fade-up fade-up-3" style={{ marginBottom: error ? 6 : 20 }}>
      {/* Label row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <label style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:600 }}>DESCRIPTION DÉTAILLÉE *</label>
        <span style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>{len} caractères</span>
      </div>

      {/* Textarea */}
      <textarea value={value} onChange={e=>{ onChange(e.target.value); setImproved(false); }} rows={5}
        placeholder={"Ex : Conception et développement WordPress, 5 pages (Accueil, À propos, Services, Blog, Contact), responsive mobile, intégration SEO de base, formulaire de contact, livraison des maquettes sous 1 semaine puis développement sur 3 semaines. Non inclus : rédaction des textes, hébergement, nom de domaine."}
        style={{
          width:"100%", padding:"12px 14px",
          background: improving ? C.creamD : C.white,
          border:`1.5px solid ${error ? C.error : improved ? "#16A34A" : focused ? C.navy : C.border}`,
          borderRadius:8, color: improving ? C.textL : C.text,
          fontSize:14, outline:"none", boxSizing:"border-box",
          resize:"vertical", fontFamily:T.body, transition:"all 0.2s", lineHeight:1.6,
          boxShadow: improved ? `0 0 0 3px #16A34A18` : focused ? `0 0 0 3px #1B2E4B10` : "none",
        }}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        disabled={improving}
      />

      {/* AI Improve button row */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, flexWrap:"wrap" }}>

        {/* The main button */}
        <button
          onClick={handleImprove}
          disabled={!canImprove || len < 20}
          title={len < 20 ? "Écris au moins 20 caractères pour activer cette fonctionnalité" : ""}
          style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 14px",
            background: improving ? C.creamD : canImprove ? C.navy : C.creamDD,
            color: improving ? C.textL : canImprove ? C.white : C.textL,
            border:`1.5px solid ${improving ? C.border : canImprove ? C.navy : C.border}`,
            borderRadius:7, cursor: canImprove ? "pointer" : "not-allowed",
            fontSize:12, fontFamily:T.body, fontWeight:600,
            transition:"all 0.18s",
            flexShrink:0,
          }}
          onMouseOver={e=>{ if(canImprove && !improving){ e.currentTarget.style.background="#152438"; e.currentTarget.style.boxShadow="0 4px 12px #1B2E4B30"; }}}
          onMouseOut={e=>{ if(canImprove && !improving){ e.currentTarget.style.background=C.navy; e.currentTarget.style.boxShadow="none"; }}}
        >
          {improving ? (
            <>
              <span style={{ width:11, height:11, border:`2px solid ${C.textL}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
              Amélioration en cours…
            </>
          ) : (
            <>
              <span style={{ fontSize:13 }}>✦</span>
              Améliorer avec l'IA
            </>
          )}
        </button>

        {/* Undo button — only shown after improvement */}
        {improved && previousValue && (
          <button onClick={handleUndo} style={{
            padding:"7px 12px", background:"transparent",
            border:`1.5px solid ${C.border}`, borderRadius:7,
            color:C.textM, fontSize:12, fontFamily:T.body,
            cursor:"pointer", transition:"all 0.15s",
          }}
            onMouseOver={e=>{ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.color=C.navy; }}
            onMouseOut={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textM; }}
          >↩ Annuler</button>
        )}

        {/* Success badge */}
        {improved && (
          <span style={{
            display:"flex", alignItems:"center", gap:5,
            fontFamily:T.body, fontSize:11, color:"#16A34A", fontWeight:500,
            animation:"fadeUp 0.3s ease both",
          }}>
            <span style={{ width:16, height:16, background:"#16A34A", borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9, color:C.white, fontWeight:700 }}>✓</span>
            Description améliorée
          </span>
        )}

        {/* Hint when not enough text */}
        {len > 0 && len < 20 && (
          <span style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>
            Encore {20 - len} caractères pour activer l'IA
          </span>
        )}
      </div>

      {/* Improve error */}
      {improveError && (
        <div style={{ marginTop:6, padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:6, fontFamily:T.body, fontSize:11, color:C.error }}>
          {improveError}
        </div>
      )}

      {/* Quality indicator */}
      {quality && !improving && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          marginTop:8, padding:"8px 12px",
          background:qualityBg, border:`1px solid ${qualityBorder}`,
          borderRadius:6, fontFamily:T.body, fontSize:11, color:qualityColor, fontWeight:500,
        }}>
          <div style={{ flex:1 }}>{qualityLabel}</div>
          <div style={{ width:60, height:4, background:"#E5E7EB", borderRadius:4, overflow:"hidden", flexShrink:0 }}>
            <div style={{
              height:"100%", borderRadius:4, background:qualityColor,
              width: quality === "bonne" ? "100%" : quality === "moyenne" ? "55%" : "20%",
              transition:"width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Tips */}
      {focused && len < 150 && !improving && (
        <div style={{ marginTop:8, padding:"10px 12px", background:C.creamD, borderRadius:6, fontFamily:T.body, fontSize:11, color:C.textM, lineHeight:1.7 }}>
          <strong style={{color:C.navy}}>Pense à inclure :</strong> livrables exacts · technologies utilisées · nombre de pages/écrans · délais intermédiaires · ce qui n'est <em>pas</em> inclus
        </div>
      )}

      {error && <p style={{ fontFamily:T.body, color:C.error, fontSize:11, margin:"5px 0 10px" }}>⚠ {error}</p>}
    </div>
  );
}

function ToggleGroup({ label, options, labels, value, onChange, tooltip }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <label style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.13em", color:C.textL, fontWeight:600 }}>{label.toUpperCase()}</label>
        {tooltip && (
          <div style={{ position:"relative", display:"inline-block" }}>
            <span
              onMouseEnter={()=>setShowTip(true)} onMouseLeave={()=>setShowTip(false)}
              style={{ width:15, height:15, borderRadius:"50%", background:C.creamDD, border:`1px solid ${C.border}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9, color:C.textL, cursor:"help", fontFamily:T.body, fontWeight:700 }}>?</span>
            {showTip && (
              <div style={{
                position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
                background:C.navy, color:C.white, fontSize:11, fontFamily:T.body, lineHeight:1.6,
                padding:"8px 12px", borderRadius:6, width:220, zIndex:10,
                boxShadow:"0 4px 16px #00000030",
              }}>
                {tooltip}
                <div style={{ position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%)", width:8, height:8, background:C.navy, rotate:"45deg" }} />
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {options.map((o,i) => (
          <button key={o} onClick={()=>onChange(o)} style={{
            padding:"9px 18px",
            background: value===o ? C.navy : C.white,
            color: value===o ? C.white : C.textM,
            border:`1.5px solid ${value===o ? C.navy : C.border}`,
            borderRadius:7, cursor:"pointer", fontSize:13, fontFamily:T.body,
            fontWeight: value===o ? 600 : 400, transition:"all 0.15s",
          }}
            onMouseOver={e=>{ if(value!==o){ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.color=C.navy; }}}
            onMouseOut={e=>{ if(value!==o){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textM; }}}
          >{labels[i]}</button>
        ))}
      </div>
    </div>
  );
}

function PricingCard({ icon, title, price, sub, features, color, cta, recommended, badge, onSelect }) {
  return (
    <div className="plan-card" style={{
      background: recommended ? C.navy : C.white,
      border: recommended ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
      borderRadius:14, padding:"20px 16px", position:"relative",
      boxShadow: recommended ? "0 12px 40px #1B2E4B28" : "0 2px 8px #1B2E4B06",
    }}>
      {(recommended || badge) && (
        <div style={{
          position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)",
          background: recommended ? C.gold : color, color: C.navyD,
          fontSize:9, fontWeight:700, padding:"3px 14px", borderRadius:20,
          letterSpacing:"0.1em", whiteSpace:"nowrap", fontFamily:T.body,
        }}>{recommended ? "RECOMMANDÉ" : badge}</div>
      )}
      <div style={{ fontSize:20, color: recommended ? C.goldL : color, marginBottom:10, fontFamily:T.display }}>{icon}</div>
      <div style={{ fontFamily:T.body, fontSize:11, letterSpacing:"0.12em", fontWeight:600, color: recommended ? "#8BA3C0" : C.textL, marginBottom:6 }}>{title.toUpperCase()}</div>
      <div style={{ fontFamily:T.display, fontSize:32, color: recommended ? C.white : C.navy, fontWeight:600, lineHeight:1, marginBottom:4 }}>{price}</div>
      <div style={{ fontFamily:T.body, fontSize:11, color: recommended ? "#6A8AAA" : C.textL, marginBottom:20 }}>{sub}</div>
      {features.map(f => (
        <div key={f} style={{ fontFamily:T.body, fontSize:12, color: recommended ? "#A0BAD4" : C.textM, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color: recommended ? C.goldL : color, fontSize:10, fontWeight:700 }}>✓</span>{f}
        </div>
      ))}
      {cta && onSelect ? (
        <button onClick={onSelect} style={{
          width:"100%", marginTop:20, padding:"12px",
          background: recommended ? C.gold : `${color}18`,
          border: recommended ? "none" : `1.5px solid ${color}`,
          borderRadius:8, color: recommended ? C.navyD : color,
          fontSize:13, cursor:"pointer", fontWeight:600, fontFamily:T.body,
          transition:"all .18s",
        }}
          onMouseOver={e=>{ e.currentTarget.style.opacity="0.85"; }}
          onMouseOut={e=>{ e.currentTarget.style.opacity="1"; }}
        >{cta}</button>
      ) : (
        <div style={{ marginTop:20, padding:"11px", background:C.creamD, borderRadius:8, textAlign:"center", fontSize:12, color:C.textL, fontFamily:T.body }}>Plan actuel</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ MAGIC AVENANT DETECTOR ══ */
function MagicAvenantDetector({ entry }) {
  const [clientMessage, setClientMessage] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | result | sent
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [sentToast, setSentToast] = useState(false);

  const contractNumMatch = entry?.contract && entry.contract.match(/CP-\d{4}-\d{3,5}/);
  const contractNum = contractNumMatch ? contractNumMatch[0] : "CP-" + new Date().getFullYear() + "-XXXX";
  const basePrice = Number(entry?.price || 555);

  const canAnalyze = clientMessage.trim().length >= 15;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setPhase("loading");
    setError("");
    try {
      const prompt = `Tu es un juriste français expert en contrats de prestation de services freelance.

Un client a envoyé le message suivant à son prestataire :
---
"${clientMessage}"
---

Contexte du contrat :
- Numéro : ${contractNum}
- Mission : ${entry?.missionTitle || "Prestation de services"}
- Prestataire : ${entry?.form?.freelanceName || "Le prestataire"}
- Client : ${entry?.clientName || "Le client"}${entry?.clientCompany ? " (" + entry.clientCompany + ")" : ""}
- Budget initial : ${basePrice} € HT

Ta tâche : Analyse le message et réponds UNIQUEMENT en JSON valide (sans backticks, sans markdown), avec ce format exact :
{
  "modifications": [
    { "type": "ajout" | "budget" | "delai" | "retrait" | "autre", "emoji": "➕" | "💰" | "📅" | "➖" | "🔄", "label": "description courte de la modification" }
  ],
  "nouveauBudget": null ou nombre (si le client mentionne un ajustement financier, calcule le nouveau total en ajoutant au budget initial de ${basePrice}€),
  "ajustementBudget": null ou nombre (montant de l'ajustement seulement, positif ou négatif),
  "nouvelleEcheance": null ou "date en toutes lettres" (si mentionnée),
  "avenantNum": 1,
  "avenantTexte": "Rédige ici l'avenant juridique complet en français, style officiel, commençant par : AVENANT N°1 AU CONTRAT ${contractNum}\\n\\nEntre les soussignés :\\n${entry?.form?.freelanceName || 'Le prestataire'}, prestataire\\net ${entry?.clientName || 'Le client'}${entry?.clientCompany ? " (" + entry.clientCompany + ")" : ""}, client\\n\\nIl est convenu d'un commun accord que... (puis rédige 2-3 clauses juridiques claires basées sur le message du client, maximum 200 mots)"
}

Sois précis et réaliste. Si le message ne contient pas de changement clair, retourne un tableau modifications vide.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = (data.content || []).map(i => i.text || "").join("").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setPhase("result");
    } catch (err) {
      setError("Erreur lors de l'analyse. Vérifie ta connexion et réessaie.");
      setPhase("idle");
    }
  };

  const handleSend = () => {
    const clientEmail = entry?.form?.clientEmail?.trim() || "";
    const subject = `Avenant au contrat — ${entry?.missionTitle || "notre mission"}`;
    const body = (result?.avenantTexte || "").replace(/\\n/g, "\n");
    window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPhase("sent");
    setSentToast(true);
    setTimeout(() => setSentToast(false), 3500);
  };

  const handleDownloadAvenant = () => {
    if (!window.jspdf || !result?.avenantTexte) { alert("PDF en cours de chargement, réessaie."); return; }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const PW = 210, ML = 22, MR = 22, cw = PW - ML - MR;
      const NAVY = [26, 54, 93], GOLD = [180, 140, 70];
      const today = new Date().toLocaleDateString("fr-FR");
      doc.setFillColor(...NAVY); doc.rect(0, 0, PW, 30, "F");
      doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(0, 30, PW, 30);
      doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255,255,255);
      doc.text("AVENANT AU CONTRAT", ML, 15);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200,215,235);
      doc.text(`Établi le ${today} via Freeley`, ML, 23);
      let y = 42;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(40,40,40);
      const txt = (result.avenantTexte || "").replace(/\\n/g, "\n");
      const lines = doc.splitTextToSize(txt, cw);
      lines.forEach(l => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(l, ML, y); y += 6;
      });
      doc.save(`Avenant_Freeley_${Date.now()}.pdf`);
    } catch(e) { alert("Erreur PDF : " + (e.message || "inconnue")); }
  };

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setClientMessage("");
    setError("");
  };

  return (
    <div className="fade-up fade-up-4" style={{
      background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
      border: "1.5px solid #C4B5FD",
      borderRadius: 18,
      padding: "0",
      marginTop: 28,
      overflow: "hidden",
      boxShadow: "0 4px 24px #7C3AED12",
    }}>

      {/* Toast envoi */}
      {sentToast && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:9999, pointerEvents:"none", animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)", color:"#fff", borderRadius:50, padding:"13px 26px", fontFamily:T.body, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px #7C3AED40", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:16 }}>✉️</span> Avenant envoyé pour signature !
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)",
        padding: "20px 24px 18px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-24, right:-24, width:96, height:96, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-16, left:60, width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
          <div style={{
            width:42, height:42, borderRadius:11, flexShrink:0,
            background:"rgba(255,255,255,0.18)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
          }}>⚡</div>
          <div>
            <div style={{ fontFamily:T.display, fontSize:17, color:"#fff", fontWeight:700, lineHeight:1.2 }}>
              Détecteur d'Avenant Magique
            </div>
            <div style={{ fontFamily:T.body, fontSize:11, color:"#DDD6FE", marginTop:3, lineHeight:1.5 }}>
              Votre client demande un changement par mail ou SMS ?<br />
              Collez son message ici pour que l'IA mette à jour votre protection contractuelle.
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"22px 24px 24px" }}>

        {/* ── PHASE IDLE / INPUT ── */}
        {(phase === "idle" || phase === "loading") && (
          <>
            <textarea
              value={clientMessage}
              onChange={e => setClientMessage(e.target.value)}
              rows={4}
              placeholder={`Exemple : "Salut ! Est-ce qu'on pourrait rajouter une option multilingue sur le site ? Je te rajoute 300€ sur le budget final et on décale la livraison au 30 septembre."`}
              disabled={phase === "loading"}
              style={{
                width:"100%", padding:"13px 15px",
                fontFamily:T.body, fontSize:13, color:C.text, lineHeight:1.65,
                background: phase === "loading" ? C.creamD : C.white,
                border:"1.5px solid #C4B5FD",
                borderRadius:11, resize:"vertical", outline:"none",
                transition:"border-color 0.15s, box-shadow 0.15s",
                boxSizing:"border-box",
                minHeight:110,
              }}
              onFocus={e => { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 3px #7C3AED18"; }}
              onBlur={e => { e.target.style.borderColor="#C4B5FD"; e.target.style.boxShadow="none"; }}
            />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4, marginBottom:14 }}>
              <div style={{ fontFamily:T.body, fontSize:10, color:"#8B5CF6" }}>
                {clientMessage.length > 0 ? `${clientMessage.length} caractères` : "Minimum 15 caractères"}
              </div>
            </div>

            {error && (
              <div style={{ padding:"10px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontFamily:T.body, fontSize:12, color:C.error, marginBottom:14 }}>
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || phase === "loading"}
              style={{
                width:"100%", padding:"14px",
                background: canAnalyze && phase !== "loading"
                  ? "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)"
                  : C.creamDD,
                border:"none", borderRadius:11,
                cursor: canAnalyze && phase !== "loading" ? "pointer" : "not-allowed",
                fontFamily:T.body, fontSize:14, fontWeight:700,
                color: canAnalyze && phase !== "loading" ? "#fff" : C.textL,
                display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                boxShadow: canAnalyze && phase !== "loading" ? "0 5px 18px #7C3AED35" : "none",
                transition:"all 0.2s",
              }}
              onMouseOver={e => { if(canAnalyze && phase !== "loading"){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px #7C3AED45"; }}}
              onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=canAnalyze&&phase!=="loading"?"0 5px 18px #7C3AED35":"none"; }}
            >
              {phase === "loading" ? (
                <>
                  <span style={{ width:15, height:15, border:"2px solid #C4B5FD", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>
                  Analyse en cours…
                </>
              ) : (
                <>🪄 Analyser et générer l'avenant</>
              )}
            </button>
          </>
        )}

        {/* ── PHASE RESULT ── */}
        {phase === "result" && result && (
          <div style={{ animation:"fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both" }}>

            {/* Modifications détectées */}
            <div style={{
              background:"#fff",
              border:"1.5px solid #DDD6FE",
              borderRadius:12, padding:"16px 18px",
              marginBottom:16,
            }}>
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.16em", fontWeight:700, color:"#7C3AED", marginBottom:12 }}>🔍 MODIFICATIONS DÉTECTÉES</div>

              {result.modifications && result.modifications.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {result.modifications.map((mod, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"9px 12px",
                      background: "#FAFAFA",
                      border:"1px solid #EDE9DF",
                      borderRadius:8,
                      fontFamily:T.body, fontSize:13, color:C.navy,
                    }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{mod.emoji}</span>
                      <span style={{ fontWeight:500 }}>{mod.label}</span>
                    </div>
                  ))}

                  {/* Budget ajusté */}
                  {result.nouveauBudget && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"9px 12px",
                      background:"#F0FDF4", border:"1px solid #86EFAC",
                      borderRadius:8,
                      fontFamily:T.body, fontSize:13, color:"#15803D", fontWeight:600,
                    }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>💰</span>
                      <span>Budget ajusté : {result.ajustementBudget > 0 ? "+" : ""}{result.ajustementBudget?.toLocaleString("fr-FR")} € HT
                        <span style={{ fontWeight:400, color:"#16A34A" }}> (Nouveau total : {result.nouveauBudget.toLocaleString("fr-FR")} € HT)</span>
                      </span>
                    </div>
                  )}

                  {/* Nouvelle échéance */}
                  {result.nouvelleEcheance && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"9px 12px",
                      background:"#EFF6FF", border:"1px solid #93C5FD",
                      borderRadius:8,
                      fontFamily:T.body, fontSize:13, color:"#1D4ED8", fontWeight:500,
                    }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>📅</span>
                      <span>Nouvelle échéance : <strong>{result.nouvelleEcheance}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, padding:"10px 0", fontStyle:"italic" }}>
                  Aucun changement structurant détecté. Reformule le message du client pour plus de précision.
                </div>
              )}
            </div>

            {/* Aperçu avenant commercial */}
            {result.avenantTexte && (
              <div style={{
                background:"#FFFDF7",
                border:"1.5px solid #D4AF7A",
                borderRadius:12, padding:"18px 20px",
                marginBottom:16,
                position:"relative",
                boxShadow:"0 2px 12px #B8965A10",
              }}>
                {/* Filigrane document officiel */}
                <div style={{
                  position:"absolute", top:12, right:14,
                  fontFamily:T.body, fontSize:8, fontWeight:700,
                  color:"#D4AF7A", letterSpacing:"0.18em",
                  opacity:0.7, textTransform:"uppercase",
                }}>DOCUMENT OFFICIEL</div>

                <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.16em", fontWeight:700, color:C.gold, marginBottom:12 }}>📄 APERÇU DE L'AVENANT GÉNÉRÉ</div>

                <div style={{
                  fontFamily:T.body, fontSize:12, color:C.text, lineHeight:1.8,
                  whiteSpace:"pre-wrap",
                  maxHeight:220,
                  overflowY:"auto",
                  paddingRight:4,
                }}>
                  {result.avenantTexte}
                </div>

                {/* Barre de défilement info */}
                <div style={{
                  marginTop:10, paddingTop:10, borderTop:"1px solid #F0E8D8",
                  fontFamily:T.body, fontSize:10, color:C.textL,
                  display:"flex", alignItems:"center", gap:6,
                }}>
                  <span>⚖️</span>
                  <span>Document conforme aux usages des prestations de services en France</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button
                onClick={handleReset}
                style={{
                  flex:"0 0 auto", padding:"12px 18px",
                  background:C.white, border:"1.5px solid #C4B5FD",
                  borderRadius:10, cursor:"pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:500, color:"#7C3AED",
                  transition:"all 0.15s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="#F5F3FF"; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >← Recommencer</button>

              <button
                onClick={handleDownloadAvenant}
                style={{
                  flex:"0 0 auto", padding:"12px 18px",
                  background:C.white, border:"1.5px solid #C4B5FD",
                  borderRadius:10, cursor:"pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:600, color:"#7C3AED",
                  transition:"all 0.15s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="#F5F3FF"; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >⬇ PDF</button>

              <button
                onClick={handleSend}
                style={{
                  flex:1, padding:"13px 18px",
                  background: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)",
                  border:"none", borderRadius:10,
                  cursor:"pointer",
                  fontFamily:T.body, fontSize:14, fontWeight:700, color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                  boxShadow:"0 5px 18px #15803D35",
                  transition:"all 0.2s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px #15803D45"; }}
                onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 5px 18px #15803D35"; }}
              >
                ✉️ Envoyer l'avenant au client
              </button>
            </div>
          </div>
        )}

        {/* ── PHASE SENT ── */}
        {phase === "sent" && (
          <div style={{ textAlign:"center", padding:"28px 16px", animation:"fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both" }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
            <div style={{ fontFamily:T.display, fontSize:20, color:"#5B21B6", fontWeight:700, marginBottom:8 }}>
              Avenant envoyé avec succès !
            </div>
            <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.65, marginBottom:22 }}>
              Ton application email s'est ouverte avec l'avenant prêt à envoyer à {entry?.clientName || "ton client"}. Il ne te reste qu'à l'envoyer. Tu peux aussi télécharger le PDF pour le joindre.
            </div>
            <button
              onClick={handleReset}
              style={{
                padding:"11px 26px",
                background:"linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)",
                border:"none", borderRadius:10,
                cursor:"pointer",
                fontFamily:T.body, fontSize:13, fontWeight:700, color:"#fff",
                boxShadow:"0 4px 14px #7C3AED35",
              }}
            >
              🪄 Analyser un autre message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ CONTRACT TIMELINE ══ */
function ContractTimeline({ entry }) {
  const clientName = entry?.clientName || "le client";

  /* Données — système events + notes client depuis store partagé */
  const systemEvents = [
    {
      id: 1,
      date: entry?.date || new Date().toLocaleDateString("fr-FR"),
      time: "",
      icon: "🟢",
      iconBg: "#DCFCE7",
      iconColor: "#15803D",
      label: "Contrat initial créé",
      detail: `Par le freelance · ${Number(entry?.price || 0).toLocaleString("fr-FR")} € HT`,
      status: "done",
      type: "system",
    },
  ];

  const [events, setEvents] = React.useState(() => [
    ...systemEvents,
    ...getClientTimelineEvents(),
  ]);

  /* Polling léger pour récupérer les nouvelles notes client (mock) */
  React.useEffect(() => {
    const interval = setInterval(() => {
      const latestClientEvents = getClientTimelineEvents();
      setEvents(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newOnes = latestClientEvents.filter(e => !existingIds.has(e.id));
        if (newOnes.length === 0) return prev;
        return [...prev, ...newOnes];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = (eventId) => {
    setEvents(prev => [
      ...prev.map(e => e.id === eventId ? { ...e, status: "accepted" } : e),
      {
        id: Date.now(),
        date: "09/06/2026",
        time: new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
        icon: "✅",
        iconBg: "#DCFCE7",
        iconColor: "#15803D",
        label: "Note acceptée — contrat mis à jour",
        detail: "Paiement en 2 fois ajouté à l'Article 3 par le freelance",
        status: "done",
        type: "system",
      },
    ]);
  };

  const handleRefuse = (eventId) => {
    setEvents(prev => [
      ...prev.map(e => e.id === eventId ? { ...e, status: "refused" } : e),
      {
        id: Date.now(),
        date: "09/06/2026",
        time: new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
        icon: "🚫",
        iconBg: "#FEE2E2",
        iconColor: "#DC2626",
        label: "Note refusée — contrat inchangé",
        detail: "Le freelance maintient les conditions de paiement initiales",
        status: "done",
        type: "system",
      },
    ]);
  };

  const hasPending = events.some(e => e.status === "pending");

  return (
    <div className="fade-up fade-up-3" style={{
      background: "#FAFAF8",
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "24px 28px",
      marginTop: 28,
      boxShadow: "0 2px 12px #1B2E4B06",
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
        <span style={{ fontSize:16 }}>🕒</span>
        <div style={{ fontFamily:T.body, fontSize:11, letterSpacing:"0.16em", fontWeight:700, color:C.textL }}>HISTORIQUE DU CONTRAT</div>
        {hasPending && (
          <span style={{
            marginLeft:"auto",
            fontFamily:T.body, fontSize:9, fontWeight:700, letterSpacing:"0.08em",
            background:"#FEF3C7", color:"#92400E",
            padding:"3px 10px", borderRadius:20,
            border:"1px solid #FDE68A",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#F59E0B", animation:"shimmer 1.4s infinite" }} />
            NOTE CLIENT EN ATTENTE
          </span>
        )}
      </div>

      {/* Timeline */}
      <div style={{ position:"relative" }}>
        {/* Ligne verticale */}
        <div style={{
          position:"absolute", left:15, top:8, bottom:8,
          width:2, background:`linear-gradient(to bottom, ${C.border}, ${C.borderL})`,
          borderRadius:2,
        }} />

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {events.map((ev, idx) => {
            const isLast = idx === events.length - 1;
            const isPending = ev.status === "pending";
            const isAccepted = ev.status === "accepted";
            const isRefused = ev.status === "refused";
            const isClientComment = ev.type === "client_comment";

            return (
              <div key={ev.id} style={{
                display:"flex", gap:16, alignItems:"flex-start",
                paddingBottom: isLast ? 0 : 24,
                animation:`fadeUp 0.35s ${idx * 0.08}s both cubic-bezier(.22,.68,0,1.2)`,
              }}>
                {/* Dot */}
                <div style={{
                  width:32, height:32, borderRadius:"50%", flexShrink:0,
                  background: isAccepted ? "#DCFCE7" : isRefused ? "#FEE2E2" : ev.iconBg,
                  border:`2px solid ${isAccepted ? "#15803D22" : isRefused ? "#DC262622" : ev.iconColor + "22"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, zIndex:1,
                  boxShadow: isPending ? `0 0 0 5px ${ev.iconColor}15` : "none",
                  transition:"all 0.3s",
                }}>
                  {isAccepted ? "✅" : isRefused ? "🚫" : ev.icon}
                </div>

                {/* Content */}
                <div style={{ flex:1, paddingTop:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                    {/* Timestamp */}
                    <span style={{
                      fontFamily:T.body, fontSize:11, fontWeight:600,
                      color:C.textL, letterSpacing:"0.04em",
                    }}>
                      {ev.date} · {ev.time}
                    </span>
                    {isClientComment && !isAccepted && !isRefused && (
                      <span style={{
                        fontFamily:T.body, fontSize:9, fontWeight:700,
                        color:"#6D28D9", background:"#F5F3FF",
                        padding:"2px 7px", borderRadius:10,
                        border:"1px solid #DDD6FE",
                      }}>VIA LIEN MAGIQUE</span>
                    )}
                    {isPending && (
                      <span style={{
                        fontFamily:T.body, fontSize:9, fontWeight:700,
                        color:"#D97706", background:"#FFFBEB",
                        padding:"2px 7px", borderRadius:10,
                        border:"1px solid #FDE68A",
                      }}>EN ATTENTE DE DÉCISION</span>
                    )}
                    {isAccepted && (
                      <span style={{
                        fontFamily:T.body, fontSize:9, fontWeight:700,
                        color:"#15803D", background:"#DCFCE7",
                        padding:"2px 7px", borderRadius:10,
                        border:"1px solid #86EFAC",
                      }}>ACCEPTÉE ✓</span>
                    )}
                    {isRefused && (
                      <span style={{
                        fontFamily:T.body, fontSize:9, fontWeight:700,
                        color:"#DC2626", background:"#FEE2E2",
                        padding:"2px 7px", borderRadius:10,
                        border:"1px solid #FECACA",
                      }}>REFUSÉE ✕</span>
                    )}
                  </div>

                  {/* Action label */}
                  <div style={{
                    fontFamily:T.body, fontSize:13, fontWeight:700,
                    color: isPending ? C.navy : isAccepted ? "#15803D" : isRefused ? "#DC2626" : C.text,
                    marginBottom: isClientComment ? 10 : 2,
                  }}>
                    {isClientComment && (
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:5,
                        background:"#EDE9FE", color:"#6D28D9",
                        fontFamily:T.body, fontSize:10, fontWeight:700,
                        padding:"2px 9px", borderRadius:20,
                        border:"1px solid #DDD6FE",
                        marginRight:8,
                        letterSpacing:"0.04em",
                      }}>
                        📎 {ev.clauseTag}
                      </span>
                    )}
                    {ev.label}
                  </div>

                  {/* Client comment bubble (Google Docs style) */}
                  {isClientComment && (
                    <div style={{
                      background: isPending ? "#FFFBEB" : isAccepted ? "#F0FDF4" : "#FEF2F2",
                      border: `1.5px solid ${isPending ? "#FDE68A" : isAccepted ? "#86EFAC" : "#FECACA"}`,
                      borderRadius:12,
                      borderTopLeftRadius:4,
                      padding:"12px 14px",
                      marginBottom: isPending ? 12 : 4,
                      transition:"all 0.3s",
                    }}>
                      {/* Author row */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{
                          width:24, height:24, borderRadius:"50%",
                          background: ev.authorColor,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontFamily:T.body, fontSize:10, fontWeight:800, color:"#fff",
                          flexShrink:0,
                        }}>{ev.authorInitials}</div>
                        <span style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:C.navy }}>
                          {ev.author}
                        </span>
                        <span style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>a commenté</span>
                      </div>

                      {/* Quote */}
                      <div style={{
                        fontFamily:T.body, fontSize:13, color:C.text,
                        lineHeight:1.6,
                        fontStyle:"italic",
                        borderLeft:`3px solid ${isPending ? "#F59E0B" : isAccepted ? "#22C55E" : "#EF4444"}`,
                        paddingLeft:10,
                        opacity: (isAccepted || isRefused) ? 0.7 : 1,
                        transition:"opacity 0.3s",
                      }}>
                        « {ev.comment} »
                      </div>
                    </div>
                  )}

                  {/* Regular detail for non-comment events */}
                  {!isClientComment && ev.detail && (
                    <div style={{
                      fontFamily:T.body, fontSize:12, color:C.textM,
                      lineHeight:1.55,
                    }}>
                      {ev.detail}
                    </div>
                  )}

                  {/* ── ACTION BUTTONS — décision ultra-rapide du freelance ── */}
                  {isPending && isClientComment && (
                    <div style={{
                      display:"flex", gap:8, marginTop:2,
                      padding:"10px 12px",
                      background:"#F8F7FF",
                      border:"1px solid #E5E7EB",
                      borderRadius:10,
                    }}>
                      {/* Context hint */}
                      <div style={{ width:"100%", marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:11 }}>⚡</span>
                        <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.textL, letterSpacing:"0.08em" }}>
                          DÉCISION RAPIDE
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:8, width:"100%", flexWrap:"wrap" }}>
                        <button
                          onClick={() => handleAccept(ev.id)}
                          style={{
                            flex:1, minWidth:140,
                            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                            padding:"11px 18px",
                            background:"linear-gradient(135deg, #166534 0%, #15803D 100%)",
                            color:"#DCFCE7", border:"none",
                            borderRadius:9, cursor:"pointer",
                            fontFamily:T.body, fontSize:13, fontWeight:700,
                            boxShadow:"0 4px 14px #15803D35",
                            transition:"all 0.18s",
                          }}
                          onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px #15803D45"; }}
                          onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px #15803D35"; }}
                        >
                          <span style={{ fontSize:15 }}>✓</span> Accepter et mettre à jour
                        </button>
                        <button
                          onClick={() => handleRefuse(ev.id)}
                          style={{
                            flex:1, minWidth:140,
                            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                            padding:"11px 18px",
                            background:"linear-gradient(135deg, #991B1B 0%, #DC2626 100%)",
                            color:"#FEE2E2", border:"none",
                            borderRadius:9, cursor:"pointer",
                            fontFamily:T.body, fontSize:13, fontWeight:700,
                            boxShadow:"0 4px 14px #DC262630",
                            transition:"all 0.18s",
                          }}
                          onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px #DC262640"; }}
                          onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px #DC262630"; }}
                        >
                          <span style={{ fontSize:15 }}>❌</span> Refuser / Laisser en l'état
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        marginTop:20, paddingTop:16,
        borderTop:`1px solid ${C.borderL}`,
        fontFamily:T.body, fontSize:11, color:C.textL,
        display:"flex", alignItems:"center", gap:6,
      }}>
        <span>🔒</span>
        <span>Toutes les modifications sont horodatées et traçables pour protéger vos droits.</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ DEPOSIT GUARD ══ */
function DepositGuard({ entry }) {
  const rawPrice = entry?.price ? parseFloat(String(entry.price).replace(/[^0-9.]/g, "")) : 557;
  const depositAmt = Math.round(rawPrice * 0.30) || 0;

  const [paid, setPaid]           = useState(false);
  const [progress, setProgress]   = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [relanceSent, setRelanceSent] = useState(false);
  const [simPulse, setSimPulse]   = useState(false);

  const handleSimulate = () => {
    setSimPulse(true);
    setTimeout(() => {
      setPaid(true);
      setProgress(30);
      setSimPulse(false);
    }, 600);
  };

  const handleCopyLink = () => {
    alert("Le paiement par carte (Stripe) sera bientôt disponible. En attendant, tes coordonnées bancaires (IBAN) figurent sur ta facture pour un règlement par virement.");
  };

  const handleRelance = () => {
    setRelanceSent(true);
    setTimeout(() => setRelanceSent(false), 3500);
  };

  return (
    <div className="fade-up" style={{ marginBottom: 24 }}>

      {/* ── BANNIÈRE PRINCIPALE ── */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: paid
          ? "0 8px 32px #15803D20"
          : "0 8px 32px #EA580C20",
        transition: "box-shadow 0.5s ease",
      }}>

        {/* Zone état */}
        {depositAmt > 0 && <div style={{
          padding: "20px 22px 18px",
          background: paid
            ? "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)"
            : "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
          border: `1.5px solid ${paid ? "#86EFAC" : "#FED7AA"}`,
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
          transition: "all 0.5s ease",
          position: "relative",
        }}>

          {/* Indicateur état */}
          <div style={{ display:"flex", alignItems:"flex-start", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: paid
                ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                : "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: paid ? "0 4px 16px #15803D35" : "0 4px 16px #EA580C35",
              transition: "all 0.5s ease",
              animation: !paid ? "shimmer 2s infinite" : "none",
            }}>
              {paid ? "🟢" : "⛔️"}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: T.body, fontSize: 15, fontWeight: 800,
                color: paid ? "#14532D" : "#9A3412",
                marginBottom: 4, lineHeight: 1.3,
                transition: "color 0.4s",
              }}>
                {paid
                  ? "Acompte sécurisé sur Stripe ! Vous pouvez démarrer la production l'esprit tranquille."
                  : `Mission suspendue : En attente du paiement de l'acompte (${depositAmt.toLocaleString("fr-FR")} €)`
                }
              </div>
              <div style={{
                fontFamily: T.body, fontSize: 12,
                color: paid ? "#166534" : "#C2410C",
                lineHeight: 1.55, opacity: 0.9,
                transition: "color 0.4s",
              }}>
                {paid
                  ? "L'acompte a été reçu et confirmé. Le contrat est actif — la mission peut démarrer immédiatement."
                  : "Ne commencez pas la production. Le contrat stipule que le projet ne démarre qu'à réception des fonds."
                }
              </div>
            </div>

            {/* Badge status */}
            <div style={{
              flexShrink: 0,
              fontFamily: T.body, fontSize: 9, fontWeight: 800,
              letterSpacing: "0.1em",
              padding: "4px 10px", borderRadius: 20,
              background: paid ? "#15803D" : "#EA580C",
              color: "#fff",
              alignSelf: "flex-start",
              boxShadow: paid ? "0 2px 8px #15803D40" : "0 2px 8px #EA580C40",
              transition: "all 0.4s",
            }}>
              {paid ? "PAYÉ ✓" : "EN ATTENTE"}
            </div>
          </div>

          {/* Barre de progression */}
          {paid && (
            <div style={{ marginTop: 16, animation: "fadeUp 0.5s ease both" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                <span style={{ fontFamily:T.body, fontSize:11, color:"#166534", fontWeight:600 }}>Avancement de la mission</span>
                <span style={{ fontFamily:T.body, fontSize:11, color:"#15803D", fontWeight:800 }}>{progress}%</span>
              </div>
              <div style={{ background:"#BBF7D0", borderRadius:8, height:8, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:8,
                  background:"linear-gradient(90deg, #15803D, #22C55E)",
                  width:`${progress}%`,
                  transition:"width 1.2s cubic-bezier(.22,.68,0,1.2)",
                  boxShadow:"0 0 12px #22C55E60",
                }} />
              </div>
              <div style={{ fontFamily:T.body, fontSize:10, color:"#166534", marginTop:5, opacity:0.8 }}>
                Acompte reçu · Production démarrée
              </div>
            </div>
          )}
        </div>}

        {/* Zone actions — visible seulement si non payé */}
        {!paid && (
          <div style={{
            padding: "16px 22px",
            background: "#FFF",
            border: "1.5px solid #FED7AA",
            borderTop: "1px solid #FFE4C8",
            borderRadius: "0 0 16px 16px",
            display: "flex", gap: 10, flexWrap: "wrap",
            animation: "fadeUp 0.3s ease both",
          }}>
            {/* Copier lien paiement */}
            <button
              onClick={handleCopyLink}
              style={{
                flex: 1, minWidth: 200,
                display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                padding:"13px 18px",
                background: linkCopied
                  ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                  : "linear-gradient(135deg, #1B2E4B 0%, #2A4167 100%)",
                color: "#fff", border:"none", borderRadius:10, cursor:"pointer",
                fontFamily:T.body, fontSize:13, fontWeight:700,
                boxShadow: linkCopied ? "0 5px 18px #15803D35" : "0 5px 18px #1B2E4B35",
                transition:"all 0.25s",
              }}
              onMouseOver={e=>{ if(!linkCopied){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px #1B2E4B45"; }}}
              onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=linkCopied?"0 5px 18px #15803D35":"0 5px 18px #1B2E4B35"; }}
            >
              {linkCopied ? (
                <><span>✅</span> Lien copié !</>
              ) : (
                <><span>🔗</span> Paiement par carte (Stripe) — bientôt disponible</>
              )}
            </button>

            {/* Relancer le client */}
            <button
              onClick={handleRelance}
              style={{
                flex: 1, minWidth: 200,
                display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                padding:"13px 18px",
                background: relanceSent
                  ? "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)"
                  : "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
                color: relanceSent ? "#fff" : "#9A3412",
                border: `1.5px solid ${relanceSent ? "#7C3AED" : "#FED7AA"}`,
                borderRadius:10, cursor:"pointer",
                fontFamily:T.body, fontSize:13, fontWeight:700,
                boxShadow: relanceSent ? "0 5px 18px #7C3AED35" : "none",
                transition:"all 0.25s",
              }}
              onMouseOver={e=>{ if(!relanceSent){ e.currentTarget.style.background="linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
              onMouseOut={e=>{ if(!relanceSent){ e.currentTarget.style.background="linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)"; e.currentTarget.style.transform="translateY(0)"; }}}
            >
              {relanceSent ? (
                <><span>✅</span> Relance envoyée !</>
              ) : (
                <><span>✉️</span> Relancer automatiquement le client</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Bouton simulation discret ── */}
      {!paid && (
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
          <button
            onClick={handleSimulate}
            style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px",
              background: simPulse ? "#F0FDF4" : "#F8F7F5",
              border:`1px solid ${simPulse ? "#86EFAC" : C.borderL}`,
              borderRadius:20, cursor:"pointer",
              fontFamily:T.body, fontSize:11, fontWeight:600,
              color: simPulse ? "#15803D" : C.textL,
              transition:"all 0.3s",
              boxShadow:"none",
            }}
            onMouseOver={e=>{ e.currentTarget.style.background="#EDE9DF"; e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textM; }}
            onMouseOut={e=>{ e.currentTarget.style.background=simPulse?"#F0FDF4":"#F8F7F5"; e.currentTarget.style.borderColor=simPulse?"#86EFAC":C.borderL; e.currentTarget.style.color=simPulse?"#15803D":C.textL; }}
          >
            <span style={{ fontSize:12, animation: simPulse ? "spin 0.6s linear" : "none" }}>⚙️</span>
            Aperçu : marquer comme payé (démo)
          </button>
        </div>
      )}

      {/* Toast relance */}
      {relanceSent && (
        <div style={{
          position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, pointerEvents:"none",
          animation:"toastSlideIn 0.35s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
            color:"#fff", borderRadius:50, padding:"13px 26px",
            fontFamily:T.body, fontSize:13, fontWeight:600,
            boxShadow:"0 8px 32px #7C3AED40", whiteSpace:"nowrap",
          }}>
            ✉️ Email de relance envoyé à {entry?.form?.clientEmail || "votre client"} !
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ HISTORY PAGE ══ */
function DashboardPage({ history, onBack, onNewContract, onOpenHistory }) {
  // Statuts de paiement stockés
  let payStatus = {};
  try { payStatus = JSON.parse(localStorage.getItem("freeley_payment_status") || "{}"); } catch(e) {}

  const total = history.length;
  let caTotal = 0, caPaid = 0, caPending = 0, nbPaid = 0, nbPending = 0, nbLate = 0;
  const now = new Date();

  history.forEach(c => {
    const price = parseFloat(c.price) || 0;
    caTotal += price;
    const st = payStatus[c.id] || "pending";
    if (st === "paid") { caPaid += price; nbPaid++; }
    else {
      caPending += price;
      if (st === "late") nbLate++; else nbPending++;
    }
  });

  const fmt = (n) => n.toLocaleString("fr-FR");
  const currentYear = now.getFullYear();
  const caThisYear = history.reduce((sum, c) => {
    const d = c.date ? c.date.split("/") : null;
    const y = d && d[2] ? Number(d[2]) : null;
    return y === currentYear ? sum + (parseFloat(c.price) || 0) : sum;
  }, 0);

  const stat = (label, value, sub, color) => (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 12px #1B2E4B06", flex:"1 1 200px", minWidth:0 }}>
      <div style={{ fontFamily:T.body, fontSize:11, letterSpacing:"0.1em", color:C.textL, fontWeight:600, marginBottom:8, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontFamily:T.display, fontSize:28, color: color || C.navy, fontWeight:700, lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily:T.body, fontSize:12, color:C.textM, marginTop:6 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 80px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.textM, fontSize:13, cursor:"pointer", fontFamily:T.body, marginBottom:16, padding:0 }}>← Accueil</button>
      <div style={{ fontFamily:T.display, fontSize:26, color:C.navy, fontWeight:700, marginBottom:4 }}>Tableau de bord</div>
      <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, marginBottom:28 }}>Vue d'ensemble de ton activité freelance.</div>

      {total === 0 ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"48px 24px", textAlign:"center", boxShadow:"0 2px 12px #1B2E4B06" }}>
          <div style={{ fontSize:40, marginBottom:16 }}>📊</div>
          <div style={{ fontFamily:T.display, fontSize:19, color:C.navy, marginBottom:8 }}>Aucune donnée pour l'instant</div>
          <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, marginBottom:24, lineHeight:1.6 }}>Crée ton premier contrat pour voir tes statistiques apparaître ici.</div>
          <button onClick={onNewContract} style={{ padding:"13px 28px", background:C.navy, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:600 }}>Créer un contrat</button>
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:16 }}>
            {stat("Chiffre d'affaires total", `${fmt(caTotal)} €`, `${total} contrat${total>1?"s":""}`, C.navy)}
            {stat("Encaissé", `${fmt(caPaid)} €`, `${nbPaid} payé${nbPaid>1?"s":""}`, "#059669")}
            {stat("En attente", `${fmt(caPending)} €`, `${nbPending + nbLate} à encaisser`, "#D97706")}
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
            {stat("CA " + currentYear, `${fmt(caThisYear)} €`, "année en cours", C.gold)}
            {stat("En retard", `${nbLate}`, nbLate > 0 ? "à relancer" : "tout est à jour", nbLate > 0 ? "#DC2626" : "#059669")}
            {stat("Taux d'encaissement", caTotal > 0 ? `${Math.round(caPaid/caTotal*100)} %` : "—", "du CA total", C.navy)}
          </div>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button onClick={onNewContract} style={{ flex:1, minWidth:160, padding:"14px", background:C.navy, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:600 }}>+ Nouveau contrat</button>
            <button onClick={onOpenHistory} style={{ flex:1, minWidth:160, padding:"14px", background:C.white, color:C.navy, border:`1.5px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:600 }}>Voir tous mes contrats</button>
          </div>
        </>
      )}
    </div>
  );
}

function CGUPage({ onBack }) {
  const H = ({ children }) => <div style={{ fontFamily:T.display, fontSize:17, color:C.navy, fontWeight:700, marginTop:24, marginBottom:8 }}>{children}</div>;
  const P = ({ children }) => <p style={{ fontFamily:T.body, fontSize:13.5, color:C.textM, lineHeight:1.7, marginBottom:10 }}>{children}</p>;
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 16px 80px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.textM, fontSize:13, cursor:"pointer", fontFamily:T.body, marginBottom:16, padding:0 }}>← Accueil</button>
      <div style={{ fontFamily:T.display, fontSize:26, color:C.navy, fontWeight:700, marginBottom:4 }}>Conditions Générales d'Utilisation</div>
      <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginBottom:20 }}>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</div>

      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 26px", boxShadow:"0 2px 12px #1B2E4B06" }}>
        <H>1. Objet</H>
        <P>Freeley est un outil d'aide à la génération de contrats de prestation de services, de factures et de documents associés, destiné aux travailleurs indépendants. Les présentes conditions régissent l'utilisation du service.</P>

        <H>2. Nature du service</H>
        <P>Freeley fournit des modèles de documents générés automatiquement, y compris à l'aide d'intelligence artificielle. Ces documents sont fournis à titre d'aide et ne constituent pas un conseil juridique. L'utilisateur reste seul responsable de la vérification, de l'adaptation et de la validité juridique des documents avant leur utilisation.</P>

        <H>3. Absence de conseil juridique</H>
        <P>Freeley n'est pas un cabinet d'avocats et ne fournit pas de prestations de conseil juridique. Pour toute situation complexe ou tout litige, il est recommandé de consulter un professionnel du droit. Freeley ne saurait être tenu responsable des conséquences liées à l'utilisation des documents générés.</P>

        <H>4. Compte utilisateur</H>
        <P>L'accès à certaines fonctionnalités nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants. Il est responsable de toute activité effectuée depuis son compte.</P>

        <H>5. Données personnelles (RGPD)</H>
        <P>Les données saisies (informations de contrat, profil, coordonnées) sont conservées de manière sécurisée et ne sont pas revendues à des tiers. L'utilisateur peut demander à tout moment la suppression de son compte et de ses données, conformément au Règlement Général sur la Protection des Données.</P>

        <H>6. Signature électronique</H>
        <P>Les signatures manuscrites tactiles et électroniques proposées par Freeley ont valeur de preuve conformément au droit français. L'utilisateur reconnaît que la valeur probante d'une signature dépend des conditions de son recueil.</P>

        <H>7. Responsabilité</H>
        <P>Freeley met tout en œuvre pour assurer la disponibilité et la fiabilité du service, sans garantie d'absence d'interruption ou d'erreur. La responsabilité de Freeley ne saurait être engagée pour les dommages indirects résultant de l'utilisation du service.</P>

        <H>8. Propriété intellectuelle</H>
        <P>Les documents que tu génères t'appartiennent. L'interface, le code et les modèles de Freeley restent la propriété de leurs auteurs et ne peuvent être reproduits sans autorisation.</P>

        <H>9. Modification des CGU</H>
        <P>Freeley se réserve le droit de modifier les présentes conditions. Les utilisateurs seront informés des modifications substantielles. L'utilisation continue du service vaut acceptation des conditions mises à jour.</P>

        <H>10. Contact</H>
        <P>Pour toute question relative aux présentes conditions, tu peux contacter l'équipe Freeley via les coordonnées indiquées sur le site.</P>
      </div>
    </div>
  );
}

function HistoryPage({ history, historyView, setHistoryView, onBack, onDownloadPDF, onDelete, onDuplicate, jsPDFReady, isPremium, onUpgrade, onRelance, onRateClient }) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [paymentStatuses, setPaymentStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("freeley_payment_status") || "{}"); } catch(e) { return {}; }
  });
  const setPaymentStatus = (contractId, status) => {
    setPaymentStatuses(prev => {
      const next = { ...prev, [contractId]: status };
      try { localStorage.setItem("freeley_payment_status", JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState("tous"); // "tous" | "pending" | "signed"

  const handleDeleteWithAnim = (id) => {
    setConfirmDelete(null);
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 450);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  /* ── Detail view ── */
  if (historyView) return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"24px 16px 80px" }}>
      {/* Back + actions bar */}
      <div className="fade-up" style={{
        background:C.navy, borderRadius:12, padding:"20px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:24, flexWrap:"wrap", gap:12,
        boxShadow:"0 8px 32px #1B2E4B30",
      }}>
        <div>
          <button onClick={() => setHistoryView(null)} style={{ background:"none", border:"none", color:"#8BA3C0", fontSize:12, cursor:"pointer", fontFamily:T.body, marginBottom:6, padding:0 }}>
            ← Retour à l'historique
          </button>
          <div style={{ fontFamily:T.display, fontSize:18, color:C.white }}>{historyView.missionTitle}</div>
          <div style={{ fontFamily:T.body, fontSize:12, color:"#8BA3C0", marginTop:2 }}>
            {historyView.clientName}{historyView.clientCompany ? ` · ${historyView.clientCompany}` : ""} · <span style={{color:C.goldL}}>{historyView.date}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => onDownloadPDF(historyView)} disabled={!jsPDFReady} style={{
            padding:"10px 20px", background: jsPDFReady ? C.gold : "#2A4167",
            color: jsPDFReady ? C.navyD : "#5A7A9A",
            border:"none", borderRadius:7, cursor: jsPDFReady ? "pointer" : "not-allowed",
            fontSize:13, fontFamily:T.body, fontWeight:600, transition:"all .2s",
          }}>⬇ Télécharger PDF</button>
          <button onClick={() => handleCopy(historyView.contract)} style={{
            padding:"10px 20px",
            background: copied ? "#1E4A3A" : "#253D5E",
            color: copied ? "#6FCFA0" : "#8BA3C0",
            border:`1px solid ${copied ? "#2D6A4F" : "#354F6E"}`,
            borderRadius:7, cursor:"pointer", fontSize:13, fontFamily:T.body, transition:"all .2s",
          }}>{copied ? "✓ Copié" : "Copier le texte"}</button>
          <button onClick={() => setConfirmDelete(historyView.id)} style={{
            padding:"10px 14px", background:"transparent", color:"#7A4A4A",
            border:"1px solid #5A3030", borderRadius:7, cursor:"pointer", fontSize:13, fontFamily:T.body,
          }}>🗑</button>
        </div>
      </div>

      {/* Suivi du paiement */}
      {(() => {
        const st = paymentStatuses[historyView.id] || "pending";
        const options = [
          { key:"pending", label:"⏳ En attente", bg:"#FEF3C7", border:"#FCD34D", color:"#92400E" },
          { key:"paid", label:"✓ Payé", bg:"#D1FAE5", border:"#6EE7B7", color:"#065F46" },
          { key:"late", label:"⚠️ En retard", bg:"#FEE2E2", border:"#FCA5A5", color:"#991B1B" },
        ];
        return (
          <div className="fade-up" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px", marginBottom:24, boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.15em", color:C.gold, fontWeight:700, marginBottom:12 }}>SUIVI DU PAIEMENT</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {options.map(o => (
                <button key={o.key} onClick={() => setPaymentStatus(historyView.id, o.key)}
                  style={{
                    padding:"10px 18px", borderRadius:9, cursor:"pointer",
                    background: st === o.key ? o.bg : C.white,
                    border: `1.5px solid ${st === o.key ? o.border : C.border}`,
                    color: st === o.key ? o.color : C.textM,
                    fontFamily:T.body, fontSize:13, fontWeight: st === o.key ? 700 : 500,
                    transition:"all .18s",
                  }}
                >{o.label}</button>
              ))}
            </div>
            {st === "paid" && <div style={{ fontFamily:T.body, fontSize:11.5, color:"#059669", marginTop:10 }}>Paiement encaissé — mission réglée. 🎉</div>}
            {st === "late" && <div style={{ fontFamily:T.body, fontSize:11.5, color:"#DC2626", marginTop:10 }}>Pense à relancer le client (module Recouvrement disponible).</div>}
          </div>
        );
      })()}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:100,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"12px",
          backdropFilter:"blur(3px)",
          animation:"fadeUp 0.2s ease both",
        }}>
          <div className="fade-up" style={{ background:C.white, borderRadius:16, padding:"24px 16px", maxWidth:380, width:"100%", boxShadow:"0 24px 64px #00000035" }}>
            <div style={{ fontSize:32, marginBottom:12, textAlign:"center" }}>⚠️</div>
            <div style={{ fontFamily:T.display, fontSize:21, color:C.navy, marginBottom:10, textAlign:"center" }}>Supprimer ce contrat ?</div>
            <p style={{ fontFamily:T.body, fontSize:12, color:"#7A4A4A", marginBottom:28, lineHeight:1.7, textAlign:"center", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px" }}>
              Attention, cette action effacera définitivement ce document de votre espace et annulera son scellé numérique.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex:1, padding:"12px", background:C.white, border:`1.5px solid ${C.border}`,
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM, fontWeight:500,
                transition:"all .15s",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >Annuler</button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); setHistoryView(null); }} style={{
                flex:1, padding:"12px", background:"#C0392B", border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.white, fontWeight:700,
                transition:"all .15s", boxShadow:"0 4px 14px #C0392B30",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background="#A93226"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#C0392B"; e.currentTarget.style.transform="translateY(0)"; }}
              >🗑️ Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ Garant d'Acompte Automatique */}
      <DepositGuard entry={historyView} />

      {/* Contract text — rendered Markdown */}
      <div className="fade-up fade-up-2">
        <MarkdownContract text={historyView.contract} form={historyView.form} />
      </div>

      {/* ⚡ Détecteur d'Avenant Magique */}
      <MagicAvenantDetector entry={historyView} />

      {/* 🕒 Historique du contrat — Timeline des modifications */}
      <ContractTimeline entry={historyView} />
    </div>
  );

  /* ── List view ── */
  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"24px 16px 80px" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:36 }}>
        <div style={{ fontFamily:T.body, fontSize:11, letterSpacing:"0.2em", color:C.gold, fontWeight:600, marginBottom:10 }}>HISTORIQUE</div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <h1 style={{ fontFamily:T.display, fontSize:32, color:C.navy, fontWeight:600, lineHeight:1.2 }}>
            Mes contrats
          </h1>
          <span style={{ fontFamily:T.body, fontSize:13, color:C.textL }}>
            {history.length} contrat{history.length !== 1 ? "s" : ""} sauvegardé{history.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Scan results link */}
      {localStorage.getItem("freeley_scan_results") && (
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:T.body, fontSize:13 }}>
          <span style={{ color:"#1D4ED8" }}>🔍 Analyse de contrat en attente</span>
          <span onClick={() => window.dispatchEvent(new CustomEvent("freeley-goto-scan"))} style={{ color:"#1D4ED8", fontWeight:700, cursor:"pointer", textDecoration:"underline", fontSize:12 }}>Voir →</span>
        </div>
      )}

      {/* Filter badges */}
      {history.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { id:"tous", label:"Tous", emoji:"📄" },
            { id:"pending", label:"En attente 🟡", emoji:null },
            { id:"signed", label:"Scellés 🟢", emoji:null },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding:"6px 14px",
              background: filter === f.id ? C.navy : C.white,
              color: filter === f.id ? C.white : C.textM,
              border:`1.5px solid ${filter === f.id ? C.navy : C.border}`,
              borderRadius:20, cursor:"pointer", fontFamily:T.body,
              fontSize:12, fontWeight: filter === f.id ? 700 : 500,
              transition:"all 0.15s",
            }}>{f.label}</button>
          ))}
        </div>
      )}

      {/* Premium upsell banner for free users */}
      {!isPremium && (
        <div className="fade-up fade-up-1" style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"#FFFBEB", border:"1px solid #FDE68A",
          borderRadius:10, padding:"14px 18px", marginBottom:24,
          flexWrap:"wrap", gap:10,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>⭐</span>
            <div>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:"#92400E" }}>
                Historique limité en version gratuite
              </div>
              <div style={{ fontFamily:T.body, fontSize:12, color:"#B45309", marginTop:2 }}>
                Passe premium pour conserver tous tes contrats sans limite
              </div>
            </div>
          </div>
          <button onClick={onUpgrade} style={{
            padding:"9px 18px", background:C.navy, color:C.white,
            border:"none", borderRadius:7, cursor:"pointer",
            fontSize:12, fontFamily:T.body, fontWeight:600, whiteSpace:"nowrap",
          }}>Voir les offres →</button>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="fade-up fade-up-2" style={{
          background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
          padding:"64px 32px", textAlign:"center",
          boxShadow:"0 2px 12px #1B2E4B06",
        }}>
          <div style={{ fontSize:40, marginBottom:16 }}>📄</div>
          <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, marginBottom:8 }}>Aucun contrat pour l'instant</div>
          <p style={{ fontFamily:T.body, color:C.textL, fontSize:14, marginBottom:24 }}>
            Génère ton premier contrat et il apparaîtra ici automatiquement.
          </p>
          <button onClick={onBack} style={{
            padding:"12px 28px", background:C.navy, color:C.white,
            border:"none", borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:T.body, fontWeight:600,
          }}>← Créer un contrat</button>
        </div>
      )}

      {/* Contract list */}
      {history.length > 0 && (
        <div className="fade-up fade-up-2" style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {history.filter(entry => {
            if (filter === "pending") return entry.signatureStatus === "pending" || entry.signatureStatus === "none" || !entry.signatureStatus;
            if (filter === "signed") return entry.signatureStatus === "signed";
            return true;
          }).length === 0 && filter !== "tous" && (
            <div style={{ textAlign:"center", padding:"40px 24px", fontFamily:T.body, fontSize:13, color:C.textL, background:C.white, border:`1px solid ${C.border}`, borderRadius:12 }}>
              Aucun contrat dans cette catégorie.
            </div>
          )}
          {history.filter(entry => {
            if (filter === "pending") return entry.signatureStatus === "pending" || entry.signatureStatus === "none" || !entry.signatureStatus;
            if (filter === "signed") return entry.signatureStatus === "signed";
            return true;
          }).map((entry, i) => {
            const isLocked = !isPremium && i >= FREE_LIMIT;
            return (
            <div key={entry.id} className={deletingId === entry.id ? "card-deleting" : ""} style={{
              background: isLocked ? C.creamD : C.white,
              border:`1px solid ${isLocked ? C.borderL : C.border}`, borderRadius:10,
              padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:12, flexWrap:"wrap",
              boxShadow: isLocked ? "none" : "0 2px 8px #1B2E4B05",
              transition:"box-shadow 0.18s, transform 0.18s",
              cursor: isLocked ? "default" : "pointer",
              opacity: isLocked ? 0.6 : 1,
              animation: deletingId === entry.id ? undefined : `fadeUp 0.4s ${i * 0.04}s both cubic-bezier(.22,.68,0,1.2)`,
            }}
              onMouseOver={e=>{ if(!isLocked){ e.currentTarget.style.boxShadow="0 6px 20px #1B2E4B10"; e.currentTarget.style.transform="translateY(-1px)"; }}}
              onMouseOut={e=>{ e.currentTarget.style.boxShadow= isLocked ? "none" : "0 2px 8px #1B2E4B05"; e.currentTarget.style.transform="translateY(0)"; }}
              onClick={() => { if(!isLocked) setHistoryView(entry); }}
            >
              {/* Left info */}
              <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0 }}>
                <div style={{
                  width:40, height:40, background: isLocked ? C.creamDD : C.creamD, borderRadius:8, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                }}>{isLocked ? "🔒" : "📄"}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:T.body, fontSize:14, fontWeight:600, color: isLocked ? C.textL : C.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {isLocked ? "Contrat verrouillé" : entry.missionTitle}
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginTop:2, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {isLocked ? "Passe premium pour accéder à ce contrat" : `${entry.clientName}${entry.clientCompany ? ` · ${entry.clientCompany}` : ""}`}
                    {!isLocked && entry.signatureStatus === "pending" && (
                      <span style={{ fontFamily:T.body, fontSize:9, background:"#DBEAFE", color:"#1D4ED8", padding:"2px 8px", borderRadius:20, fontWeight:700, letterSpacing:"0.05em" }}>✍ SIGNATURE EN ATTENTE</span>
                    )}
                    {!isLocked && entry.signatureStatus === "signed" && (
                      <span style={{ fontFamily:T.body, fontSize:9, background:"#DCFCE7", color:"#15803D", padding:"2px 8px", borderRadius:20, fontWeight:700, letterSpacing:"0.05em" }}>✓ SIGNÉ</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: price + date + actions */}
              <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                {!isLocked && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:T.display, fontSize:15, fontWeight:600, color:C.navy }}>
                      {Number(entry.price).toLocaleString("fr-FR")} €
                    </div>
                    <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>{entry.date}</div>
                  </div>
                )}
                {isLocked ? (
                  <button onClick={e => { e.stopPropagation(); onUpgrade(); }} style={{
                    padding:"8px 14px", background:C.navy, color:C.white,
                    border:"none", borderRadius:7, cursor:"pointer",
                    fontSize:11, fontFamily:T.body, fontWeight:600,
                  }}>Débloquer →</button>
                ) : (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); onDownloadPDF(entry); }}
                      disabled={!jsPDFReady}
                      title="Télécharger PDF"
                      style={{
                        width:34, height:34, background:C.creamD, border:`1px solid ${C.border}`,
                        borderRadius:7, cursor: jsPDFReady ? "pointer" : "not-allowed",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                        transition:"all .15s", flexShrink:0,
                      }}
                      onMouseOver={e=>{ e.stopPropagation(); if(jsPDFReady){ e.currentTarget.style.background=C.gold; e.currentTarget.style.borderColor=C.gold; }}}
                      onMouseOut={e=>{ e.currentTarget.style.background=C.creamD; e.currentTarget.style.borderColor=C.border; }}
                    >⬇</button>
                    <button
                      onClick={e => { e.stopPropagation(); if(onDuplicate) onDuplicate(entry); }}
                      title="Dupliquer"
                      style={{
                        width:34, height:34, background:C.creamD, border:`1px solid ${C.border}`,
                        borderRadius:7, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                        transition:"all .15s", flexShrink:0,
                      }}
                      onMouseOver={e=>{ e.stopPropagation(); e.currentTarget.style.background="#EFF6FF"; e.currentTarget.style.borderColor="#93C5FD"; }}
                      onMouseOut={e=>{ e.currentTarget.style.background=C.creamD; e.currentTarget.style.borderColor=C.border; }}
                    >📋</button>
                    {(entry.signatureStatus === "pending" || entry.signatureStatus === "none" || !entry.signatureStatus) && (
                      <button
                        onClick={e => { e.stopPropagation(); if(onRelance) onRelance(); }}
                        title="Relancer le client"
                        style={{
                          height:34, padding:"0 10px",
                          background:"#F0FDF4", border:"1px solid #86EFAC",
                          borderRadius:7, cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                          fontSize:11, fontFamily:T.body, fontWeight:700, color:"#15803D",
                          transition:"all .15s", flexShrink:0, whiteSpace:"nowrap",
                        }}
                        onMouseOver={e=>{ e.stopPropagation(); e.currentTarget.style.background="#DCFCE7"; e.currentTarget.style.borderColor="#4ADE80"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 12px #15803D20"; }}
                        onMouseOut={e=>{ e.currentTarget.style.background="#F0FDF4"; e.currentTarget.style.borderColor="#86EFAC"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                      >⚡ Relancer</button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); if(onRateClient) onRateClient(entry); }}
                      title="Clôturer et noter ce client"
                      style={{
                        height:34, padding:"0 10px",
                        background:"#FFFBEB", border:"1px solid #FCD34D",
                        borderRadius:7, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                        fontSize:11, fontFamily:T.body, fontWeight:700, color:"#92400E",
                        transition:"all .15s", flexShrink:0, whiteSpace:"nowrap",
                      }}
                      onMouseOver={e=>{ e.stopPropagation(); e.currentTarget.style.background="#FEF3C7"; e.currentTarget.style.borderColor="#FBBF24"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 12px #FBBF2430"; }}
                      onMouseOut={e=>{ e.currentTarget.style.background="#FFFBEB"; e.currentTarget.style.borderColor="#FCD34D"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                    >🌟 Clôturer</button>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(entry.id); }}
                      title="Supprimer"
                      style={{
                        width:34, height:34, background:C.creamD, border:`1px solid ${C.border}`,
                        borderRadius:7, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:13,
                        transition:"all .15s", flexShrink:0,
                      }}
                      onMouseOver={e=>{ e.stopPropagation(); e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; }}
                      onMouseOut={e=>{ e.currentTarget.style.background=C.creamD; e.currentTarget.style.borderColor=C.border; }}
                    >🗑</button>
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete modal (list view) */}
      {confirmDelete && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:100,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"12px",
          backdropFilter:"blur(3px)",
          animation:"fadeUp 0.2s ease both",
        }}>
          <div className="fade-up" style={{ background:C.white, borderRadius:16, padding:"24px 16px", maxWidth:380, width:"100%", boxShadow:"0 24px 64px #00000035" }}>
            <div style={{ fontSize:32, marginBottom:12, textAlign:"center" }}>⚠️</div>
            <div style={{ fontFamily:T.display, fontSize:21, color:C.navy, marginBottom:10, textAlign:"center" }}>Supprimer ce contrat ?</div>
            <p style={{ fontFamily:T.body, fontSize:12, color:"#7A4A4A", marginBottom:28, lineHeight:1.7, textAlign:"center", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px" }}>
              Attention, cette action effacera définitivement ce document de votre espace et annulera son scellé numérique.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex:1, padding:"12px", background:C.white, border:`1.5px solid ${C.border}`,
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM, fontWeight:500,
                transition:"all .15s",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background=C.creamD; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
              >Annuler</button>
              <button onClick={() => { handleDeleteWithAnim(confirmDelete); }} style={{
                flex:1, padding:"12px", background:"#C0392B", border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.white, fontWeight:700,
                transition:"all .15s", boxShadow:"0 4px 14px #C0392B30",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background="#A93226"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="#C0392B"; e.currentTarget.style.transform="translateY(0)"; }}
              >🗑️ Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign:"center", marginTop:36 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.textL, fontSize:13, cursor:"pointer", fontFamily:T.body, textDecoration:"underline" }}>
          ← Retour à l'outil
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ INVOICE MODAL ══ */
function InvoiceModal({ form, profile, onClose, depositPctProp, onDepositPctChange }) {
  const [downloaded, setDownloaded] = useState(false);
  const [_depositPct, setLocalDepositPct] = useState(depositPctProp ?? Number(form.acomptePourcentage) ?? 30);
  const depositPct = depositPctProp ?? _depositPct;
  const setDepositPct = (v) => {
    setLocalDepositPct(v);
    if (onDepositPctChange) onDepositPctChange(v);
  };
  const [copiedSms, setCopiedSms]       = useState(false);
  const [copiedEmailRelance, setCopiedEmailRelance] = useState(false);

  const today = new Date().toLocaleDateString("fr-FR");
  // Numéro affiché en aperçu (prochain numéro disponible, sans le réserver)
  const invoiceNum = useMemo(() => {
    const year = new Date().getFullYear();
    let counters = {};
    try { counters = JSON.parse(localStorage.getItem("freeley_invoice_counters") || "{}"); } catch(e) {}
    const next = (counters[year] || 0) + 1;
    return `FA-${year}-${String(next).padStart(4, "0")}`;
  }, []);

  // Réserve définitivement le numéro (appelé au téléchargement) — garantit une suite continue sans trou
  const reserveInvoiceNumber = () => {
    const year = new Date().getFullYear();
    let counters = {};
    try { counters = JSON.parse(localStorage.getItem("freeley_invoice_counters") || "{}"); } catch(e) {}
    counters[year] = (counters[year] || 0) + 1;
    try { localStorage.setItem("freeley_invoice_counters", JSON.stringify(counters)); } catch(e) {}
  };

  const priceHT = parseFloat(form.price) || 0;
  const acompte = priceHT * (depositPct / 100);
  const tva     = acompte * 0.2;
  const ttc     = acompte + tva;

  const hasSiret   = !!form.freelanceSiret?.trim();
  const hasMission = !!form.missionTitle?.trim();
  const hasClient  = !!form.clientName?.trim();
  const hasPrice   = priceHT > 0;

  const fmt = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits:2, maximumFractionDigits:2 });

  // ── Textes de relance ──
  const clientFullName     = form.clientName?.trim()       || "client";
  const clientFirstName    = clientFullName.split(" ")[0];
  const freelanceName      = form.freelanceName?.trim()    || "le prestataire";
  const freelanceFirstName = freelanceName.split(" ")[0];
  const activityLabel      = form.freelanceActivity?.trim() || "prestation";
  const missionLabel       = form.missionTitle?.trim()     || "notre mission";
  const acompteTTC = (priceHT * (depositPct / 100) * 1.2);
  const acompteTTCStr = hasPrice ? `${fmt(acompteTTC)} €` : "le montant convenu";
  const isComptant = depositPct === 100;

  const smsText = isComptant
    ? `Bonjour ${clientFirstName}, c'est ${freelanceFirstName} 👋 Je t'envoie un petit rappel concernant la facture de paiement comptant pour « ${missionLabel} » (${acompteTTCStr} TTC). Tu peux me faire un virement dès que possible pour qu'on démarre sereinement. Merci !`
    : `Bonjour ${clientFirstName}, c'est ${freelanceFirstName} 👋 Je t'envoie un petit rappel concernant la facture d'acompte pour « ${missionLabel} » (${acompteTTCStr} TTC). Tu peux me faire un virement dès que possible pour qu'on démarre sereinement. Merci !`;

  const emailSubject = isComptant
    ? `Rappel : paiement comptant — ${missionLabel}`
    : `Rappel : facture d'acompte — ${missionLabel}`;
  const emailBody = isComptant
    ? `Bonjour ${clientFullName},

J'espère que tu vas bien.

Je me permets de te relancer concernant la facture de paiement comptant n° ${invoiceNum} d'un montant de ${acompteTTCStr} TTC, relative à notre mission de ${activityLabel}.

Pour rappel, ce règlement intégral conditionne le démarrage des travaux. N'hésite pas à me contacter si tu as la moindre question.

Merci d'avance,
${freelanceName}`
    : `Bonjour ${clientFullName},

J'espère que tu vas bien.

Je me permets de te relancer concernant la facture d'acompte n° ${invoiceNum} d'un montant de ${acompteTTCStr} TTC, relative à notre mission de ${activityLabel}.

Pour rappel, cet acompte conditionne le démarrage des travaux. N'hésite pas à me contacter si tu as la moindre question.

Merci d'avance,
${freelanceName}`;

  const clientEmail = form.clientEmail?.trim() || "";
  const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const smsLink    = `sms:?body=${encodeURIComponent(smsText)}`;

  const handleCopyRelance = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2200);
    });
  };

  const handleFakeDownload = () => {
    if (!window.jspdf) { alert("PDF en cours de chargement, réessaie dans un instant."); return; }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const PW = 210, ML = 20, MR = 20, cw = PW - ML - MR;
      const NAVY = [26, 54, 93], GOLD = [180, 140, 70], DARK = [44, 62, 80], GREY = [110, 110, 110];
      const p = profile || {};
      let y = 18;

      // En-tête : logo + titre facture
      if (p.logo) {
        try { doc.addImage(p.logo, "PNG", ML, y, 26, 26); } catch(e) {}
      }
      doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(...NAVY);
      doc.text("FACTURE", PW - MR, y + 8, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
      doc.text(`N° ${invoiceNum}`, PW - MR, y + 15, { align: "right" });
      doc.text(`Date : ${today}`, PW - MR, y + 20, { align: "right" });
      y += 34;

      doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.line(ML, y, PW - MR, y);
      y += 10;

      // Émetteur (freelance) et Client — deux colonnes
      const colW = cw / 2 - 4;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...NAVY);
      doc.text("ÉMETTEUR", ML, y);
      doc.text("CLIENT", ML + colW + 8, y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...DARK);
      let yL = y + 6, yR = y + 6;
      const line = (txt, x, yy) => { if (txt) { const ls = doc.splitTextToSize(String(txt), colW); doc.text(ls, x, yy); return ls.length * 4.6; } return 0; };
      yL += line(p.companyName || form.freelanceName, ML, yL);
      yL += line(p.legalStatus, ML, yL);
      yL += line(p.address || form.freelanceAddress, ML, yL);
      yL += line(form.freelanceSiret ? "SIRET : " + form.freelanceSiret : (p.siret ? "SIRET : " + p.siret : ""), ML, yL);
      yL += line(form.freelanceEmail, ML, yL);
      yL += line(p.tvaNumber ? "TVA : " + p.tvaNumber : "", ML, yL);
      const cx = ML + colW + 8;
      yR += line(form.clientName, cx, yR);
      yR += line(form.clientCompany, cx, yR);
      yR += line(form.clientAddress, cx, yR);
      yR += line(form.clientEmail, cx, yR);
      y = Math.max(yL, yR) + 8;

      // Tableau prestation
      doc.setFillColor(...NAVY); doc.rect(ML, y, cw, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
      doc.text("DÉSIGNATION", ML + 3, y + 6);
      doc.text("MONTANT", PW - MR - 3, y + 6, { align: "right" });
      y += 9;

      const label = isComptant ? "Paiement comptant" : `Acompte ${depositPct}%`;
      const desc = `${label} — ${form.missionTitle || "Prestation de services"}`;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...DARK);
      const descLines = doc.splitTextToSize(desc, cw - 45);
      doc.text(descLines, ML + 3, y + 6);
      doc.text(`${fmt(acompte)} €`, PW - MR - 3, y + 6, { align: "right" });
      const rowH = Math.max(10, descLines.length * 4.6 + 4);
      doc.setDrawColor(225,225,225); doc.line(ML, y + rowH, PW - MR, y + rowH);
      y += rowH + 6;

      // Totaux
      const tvaApplicable = !!(p.tvaNumber && p.tvaNumber.trim());
      const totalsX = PW - MR - 70;
      const val = (lbl, amount, bold) => {
        doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 11 : 9.5);
        doc.setTextColor(...(bold ? NAVY : DARK));
        doc.text(lbl, totalsX, y);
        doc.text(`${fmt(amount)} €`, PW - MR, y, { align: "right" });
        y += bold ? 8 : 6;
      };
      val("Total HT", acompte, false);
      if (tvaApplicable) { val("TVA 20%", tva, false); val("Total TTC", ttc, true); }
      else {
        doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
        doc.text("TVA non applicable, art. 293 B du CGI", totalsX, y); y += 6;
        val("Total à payer", acompte, true);
      }
      y += 8;

      // Coordonnées de paiement (IBAN)
      doc.setFillColor(248, 246, 240); doc.roundedRect(ML, y, cw, p.iban ? 30 : 20, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...NAVY);
      doc.text("COORDONNÉES DE PAIEMENT", ML + 4, y + 7);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
      if (p.iban) {
        doc.text(`IBAN : ${p.iban}`, ML + 4, y + 14);
        if (p.bic) doc.text(`BIC : ${p.bic}`, ML + 4, y + 20);
        if (p.bankName) doc.text(`Banque : ${p.bankName}`, ML + 4, y + 26);
      } else {
        doc.setTextColor(...GREY);
        doc.text("Ajoute ton IBAN dans ton profil (onglet Facturation) pour l'afficher ici.", ML + 4, y + 14);
      }
      y += (p.iban ? 30 : 20) + 10;

      // Pied de page
      doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(...GREY);
      const foot = isComptant
        ? "Règlement à réception de facture. Ce paiement conditionne le démarrage de la mission."
        : `Acompte de ${depositPct}% conditionnant le démarrage de la mission. Le solde sera facturé à la livraison.`;
      doc.text(doc.splitTextToSize(foot, cw), ML, y);

      doc.save(`Facture_${invoiceNum}.pdf`);
      reserveInvoiceNumber();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch(err) {
      console.error(err);
      alert("Erreur lors de la génération de la facture : " + (err.message || "inconnue"));
    }
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"#00000065", zIndex:400,
        display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:"20px 16px", overflowY:"auto",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:16, width:"100%", maxWidth:480,
        boxShadow:"0 32px 80px #00000030", overflow:"hidden",
        marginTop:16, marginBottom:16,
      }}>

        {/* Header modal */}
        <div style={{
          background:C.navy, padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#FFFBEB", borderRadius:8,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🧾</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:17, color:C.white, fontWeight:600 }}>
                {depositPct === 100 ? "Facture — Paiement comptant" : "Facture d'acompte"}
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#8BA3C0", marginTop:1 }}>
                {depositPct === 100 ? "100% du montant total HT — règlement immédiat" : `${depositPct}% du montant total HT`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:"50%", background:"#253D5E",
            border:"none", color:"#8BA3C0", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>✕</button>
        </div>

        {/* Corps */}
        <div style={{ padding:"24px 24px 0" }}>

          {/* Avertissement données manquantes */}
          {(!hasClient || !hasPrice) && (
            <div style={{
              background:"#FFFBEB", border:"1px solid #FDE68A",
              borderRadius:8, padding:"10px 14px", marginBottom:16,
              fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.6,
            }}>
              💡 <strong>Remplis les étapes 1 et 3</strong> pour voir ta facture complète (client + montant).
            </div>
          )}

          {/* Numéro + date */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.15em", color:C.textL, fontWeight:600, marginBottom:3 }}>FACTURE N°</div>
              <div style={{ fontFamily:T.display, fontSize:18, color:C.navy, fontWeight:600 }}>{invoiceNum}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.15em", color:C.textL, fontWeight:600, marginBottom:3 }}>DATE D'ÉMISSION</div>
              <div style={{ fontFamily:T.body, fontSize:13, color:C.navy, fontWeight:500 }}>{today}</div>
            </div>
          </div>

          <div style={{ height:1, background:C.borderL, marginBottom:18 }} />

          {/* Prestataire / Client */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12, marginBottom:18 }}>
            <div style={{ background:C.creamD, borderRadius:9, padding:"12px 14px" }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:6 }}>PRESTATAIRE</div>
              {profile?.photo && (
                <div style={{ marginBottom:8 }}>
                  <img src={profile.photo} alt="profil" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.border}` }} />
                </div>
              )}
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, marginBottom:2 }}>
                {form.freelanceName || <span style={{color:C.textL, fontStyle:"italic"}}>Non renseigné</span>}
              </div>
              {form.freelanceActivity && <div style={{ fontFamily:T.body, fontSize:11, color:C.textM }}>{form.freelanceActivity}</div>}
              {hasSiret && <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:3 }}>SIRET : {form.freelanceSiret}</div>}
              {form.freelanceEmail && <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:2 }}>{form.freelanceEmail}</div>}
              {profile?.linkedin && <div style={{ fontFamily:T.body, fontSize:10, color:"#0077B5", marginTop:3, wordBreak:"break-all" }}>🔗 LinkedIn</div>}
            </div>
            <div style={{ background:C.creamD, borderRadius:9, padding:"12px 14px" }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:6 }}>CLIENT</div>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, marginBottom:2 }}>
                {form.clientName || <span style={{color:C.textL, fontStyle:"italic"}}>Non renseigné</span>}
              </div>
              {form.clientCompany && <div style={{ fontFamily:T.body, fontSize:11, color:C.textM }}>{form.clientCompany}</div>}
              {form.clientEmail && <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginTop:3 }}>{form.clientEmail}</div>}
            </div>
          </div>

          {/* Sélecteur de pourcentage d'acompte */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:8 }}>TAUX D'ACOMPTE</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[10, 20, 30, 40, 50].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDepositPct(pct)}
                  style={{
                    flex:"1 1 30%", padding:"9px 0",
                    background: depositPct === pct ? C.navy : C.white,
                    border: `1.5px solid ${depositPct === pct ? C.navy : C.border}`,
                    borderRadius:8, cursor:"pointer",
                    fontFamily:T.body, fontSize:13, fontWeight:700,
                    color: depositPct === pct ? C.white : C.textM,
                    transition:"all 0.18s",
                    boxShadow: depositPct === pct ? "0 4px 12px #1B2E4B25" : "none",
                  }}
                >
                  {pct} %
                </button>
              ))}
              <button
                onClick={() => setDepositPct(100)}
                style={{
                  flex:"1 1 100%", padding:"9px 0",
                  background: depositPct === 100
                    ? "linear-gradient(135deg, #15803D 0%, #16A34A 100%)"
                    : C.white,
                  border: `1.5px solid ${depositPct === 100 ? "#15803D" : C.border}`,
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:700,
                  color: depositPct === 100 ? C.white : C.textM,
                  transition:"all 0.18s",
                  boxShadow: depositPct === 100 ? "0 4px 12px #15803D30" : "none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}
              >
                {depositPct === 100 && <span style={{ fontSize:12 }}>✓</span>}
                100 % <span style={{ fontSize:11, fontWeight:500, opacity:0.85 }}>(Comptant)</span>
              </button>
            </div>
          </div>

          {/* Ligne prestation */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:8 }}>DÉTAIL DE LA PRESTATION</div>
            <div style={{ border:`1px solid ${C.border}`, borderRadius:9, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", background:C.navy,
                padding:"9px 14px", fontFamily:T.body, fontSize:10, fontWeight:700,
                color:"#8BA3C0", letterSpacing:"0.08em",
              }}>
                <span>DESCRIPTION</span>
                <span style={{ textAlign:"right" }}>MONTANT HT</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto",
                padding:"12px 14px", background:C.white, alignItems:"center", gap:8,
              }}>
                <div>
                  <div style={{ fontFamily:T.body, fontSize:13, color:C.navy, fontWeight:500 }}>
                    {depositPct === 100
                      ? (hasMission ? `Totalité de la prestation (Comptant) — ${form.missionTitle}` : "Totalité de la prestation (Comptant)")
                      : (hasMission ? `Acompte — ${form.missionTitle}` : "Acompte sur prestation")
                    }
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginTop:2 }}>
                    {depositPct === 100
                      ? (hasPrice ? `Montant total : ${fmt(priceHT)} € HT` : "montant non renseigné")
                      : `${depositPct}% du total (${hasPrice ? `${fmt(priceHT)} € HT` : "montant non renseigné"})`
                    }
                  </div>
                </div>
                <div style={{ fontFamily:T.display, fontSize:16, color:C.navy, fontWeight:600, textAlign:"right", whiteSpace:"nowrap" }}>
                  {hasPrice ? `${fmt(acompte)} €` : "— €"}
                </div>
              </div>
            </div>
          </div>

          {/* Totaux */}
          <div style={{ background:C.creamD, borderRadius:9, padding:"14px 16px", marginBottom:18 }}>
            {[
              ["Sous-total HT", hasPrice ? `${fmt(acompte)} €` : "—"],
              ["TVA 20 %",      hasPrice ? `${fmt(tva)} €`     : "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between",
                fontFamily:T.body, fontSize:12, color:C.textM, marginBottom:7,
              }}>
                <span>{label}</span>
                <span style={{ fontWeight:500, color:C.navy }}>{val}</span>
              </div>
            ))}
            <div style={{ height:1, background:C.border, margin:"10px 0" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy }}>TOTAL TTC</span>
              <span style={{ fontFamily:T.display, fontSize:22, fontWeight:700, color:C.navy }}>
                {hasPrice ? `${fmt(ttc)} €` : "—"}
              </span>
            </div>
          </div>

          {/* Conditions */}
          <div style={{
            background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8,
            padding:"10px 14px", marginBottom:20,
            fontFamily:T.body, fontSize:11, color:"#15803D", lineHeight:1.6,
          }}>
            {depositPct === 100
              ? "✓ Paiement comptant intégral à la commande · Paiement par virement bancaire"
              : "✓ Acompte à régler à la commande · Paiement par virement bancaire"
            }
          </div>
          {/* Mention informative */}
          <div style={{
            borderTop:`1px solid ${C.borderL}`, paddingTop:12, marginBottom:20,
            fontFamily:T.body, fontSize:10, color:C.textL, lineHeight:1.6,
          }}>
            Pénalités de retard : Taux BCE + 10 points. Indemnité forfaitaire de recouvrement : 40€.
          </div>
        </div>

        {/* ── Zone Paiement ── */}
        <div style={{ padding:"0 24px 20px" }}>
          <div style={{
            background:"linear-gradient(135deg, #0F1C2D 0%, #1B2E4B 60%, #2A4167 100%)",
            borderRadius:12, padding:"16px",
            boxShadow:"0 6px 24px #1B2E4B28",
            position:"relative", overflow:"hidden",
          }}>
            {/* Subtle shimmer accent */}
            <div style={{
              position:"absolute", top:-20, right:-20,
              width:80, height:80, borderRadius:"50%",
              background:"radial-gradient(circle, #B8965A20 0%, transparent 70%)",
              pointerEvents:"none",
            }} />

            {/* Title */}
            <div style={{
              display:"flex", alignItems:"center", gap:7, marginBottom:14,
            }}>
              <span style={{ fontSize:13 }}>🏦</span>
              <span style={{
                fontFamily:T.body, fontSize:11, fontWeight:700,
                letterSpacing:"0.12em", color:"#8BA3C0",
              }}>PAIEMENT PAR VIREMENT</span>
            </div>

            {/* Content row */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{
                background:C.white, borderRadius:8, padding:12,
                flexShrink:0, boxShadow:"0 4px 12px #00000030",
                display:"flex", alignItems:"center", justifyContent:"center",
                width:72, height:72, boxSizing:"border-box",
              }}>
                <span style={{ fontSize:32 }}>🏦</span>
              </div>

              {/* Description text */}
              <div style={{ flex:1 }}>
                <p style={{
                  fontFamily:T.body, fontSize:11.5, color:"#C8D8EC",
                  lineHeight:1.65, margin:0,
                }}>
                  {depositPct === 100
                    ? <>Ton client règle la <span style={{ color:C.goldL, fontWeight:600 }}>totalité</span> par virement bancaire, grâce à l'IBAN indiqué ci-dessus.</>
                    : <>Ton client règle l'acompte par virement bancaire, grâce à l'IBAN indiqué ci-dessus.</>
                  }
                  {" "}Le paiement par <span style={{ color:C.goldL, fontWeight:600 }}>carte bancaire</span> arrive bientôt.
                </p>
                {/* Badges */}
                <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                  {["🔒 Sécurisé", "🏦 Virement IBAN", "📄 Facture PDF"].map(badge => (
                    <span key={badge} style={{
                      fontFamily:T.body, fontSize:9.5, fontWeight:600,
                      padding:"3px 8px",
                      background:"#FFFFFF14",
                      border:"1px solid #FFFFFF18",
                      borderRadius:20, color:"#8BA3C0",
                      letterSpacing:"0.03em",
                    }}>{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RELANCE ACOMPTE ══ */}
        <div style={{ padding:"0 24px 20px" }}>
          {/* Titre section */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, marginBottom:14,
          }}>
            <div style={{ flex:1, height:1, background:C.borderL }} />
            <span style={{
              fontFamily:T.body, fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              color:C.textL, whiteSpace:"nowrap",
            }}>📬 {isComptant ? "RELANCER POUR LE PAIEMENT" : "RELANCER VOTRE CLIENT"}</span>
            <div style={{ flex:1, height:1, background:C.borderL }} />
          </div>

          {/* Bloc SMS */}
          <div style={{
            background:"#F0F9FF", border:"1px solid #BAE6FD",
            borderRadius:12, padding:"14px 16px", marginBottom:12,
          }}>
            <div style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:10,
            }}>
              <span style={{ fontSize:14 }}>📱</span>
              <span style={{
                fontFamily:T.body, fontSize:11, fontWeight:700,
                color:"#0369A1", letterSpacing:"0.05em",
              }}>VERSION SMS</span>
            </div>
            <div style={{
              background:C.white, border:"1px solid #BAE6FD",
              borderRadius:8, padding:"10px 13px", marginBottom:10,
              fontFamily:T.body, fontSize:12, color:"#0C4A6E",
              lineHeight:1.65, fontStyle:"italic",
            }}>
              {smsText}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => handleCopyRelance(smsText, setCopiedSms)}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"9px 0",
                  background: copiedSms ? "#16A34A" : C.white,
                  border:`1.5px solid ${copiedSms ? "#16A34A" : "#BAE6FD"}`,
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, fontWeight:600,
                  color: copiedSms ? C.white : "#0369A1",
                  transition:"all 0.2s",
                }}
              >
                {copiedSms ? "✓ Copié !" : "📋 Copier"}
              </button>
              <a
                href={smsLink}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"9px 0",
                  background:"#0EA5E9",
                  border:"none",
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, fontWeight:700,
                  color:C.white, textDecoration:"none",
                  transition:"all 0.2s",
                  boxShadow:"0 3px 10px #0EA5E930",
                }}
              >
                📱 Envoyer par SMS
              </a>
            </div>
          </div>

          {/* Bloc Email */}
          <div style={{
            background:"#F5F3FF", border:"1px solid #DDD6FE",
            borderRadius:12, padding:"14px 16px",
          }}>
            <div style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:10,
            }}>
              <span style={{ fontSize:14 }}>✉️</span>
              <span style={{
                fontFamily:T.body, fontSize:11, fontWeight:700,
                color:"#6D28D9", letterSpacing:"0.05em",
              }}>VERSION E-MAIL</span>
              {clientEmail && (
                <span style={{
                  marginLeft:"auto", fontFamily:T.body, fontSize:10,
                  color:"#7C3AED", background:"#EDE9FE",
                  padding:"2px 8px", borderRadius:20, fontWeight:600,
                }}>
                  → {clientEmail}
                </span>
              )}
            </div>
            <div style={{
              background:C.white, border:"1px solid #DDD6FE",
              borderRadius:8, padding:"10px 13px", marginBottom:10,
              fontFamily:T.body, fontSize:12, color:"#3B0764",
              lineHeight:1.7, fontStyle:"italic",
              whiteSpace:"pre-line",
            }}>
              {emailBody}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => handleCopyRelance(emailBody, setCopiedEmailRelance)}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"9px 0",
                  background: copiedEmailRelance ? "#16A34A" : C.white,
                  border:`1.5px solid ${copiedEmailRelance ? "#16A34A" : "#DDD6FE"}`,
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, fontWeight:600,
                  color: copiedEmailRelance ? C.white : "#6D28D9",
                  transition:"all 0.2s",
                }}
              >
                {copiedEmailRelance ? "✓ Copié !" : "📋 Copier"}
              </button>
              <a
                href={mailtoLink}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"9px 0",
                  background:"#7C3AED",
                  border:"none",
                  borderRadius:8, cursor:"pointer",
                  fontFamily:T.body, fontSize:12, fontWeight:700,
                  color:C.white, textDecoration:"none",
                  transition:"all 0.2s",
                  boxShadow:"0 3px 10px #7C3AED30",
                }}
              >
                ✉️ Ouvrir dans mon Mail
              </a>
            </div>
          </div>
        </div>

        {/* Footer boutons */}
        <div style={{ padding:"0 24px 20px", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"12px", background:C.creamD, border:`1px solid ${C.border}`,
            borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:T.body,
            color:C.textM, fontWeight:500,
          }}>Fermer</button>
          <button onClick={handleFakeDownload} style={{
            flex:2, padding:"12px",
            background: downloaded ? "#16A34A" : C.gold,
            border:"none", borderRadius:8, cursor:"pointer",
            fontSize:13, fontFamily:T.body, fontWeight:700,
            color: downloaded ? C.white : C.navyD,
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            transition:"background 0.25s",
            boxShadow: downloaded ? "none" : "0 4px 14px #B8965A35",
          }}>
            {downloaded
              ? <><span style={{fontSize:15}}>✓</span> Facture générée !</>
              : <><span style={{fontSize:15}}>⬇</span> Télécharger la facture PDF</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ SCANNER MODAL ══ */
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        focusMode: "continuous",
      },
      audio: false,
    })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        // Activer l'autofocus continu si supporté
        try {
          const track = stream.getVideoTracks()[0];
          const caps = track.getCapabilities ? track.getCapabilities() : {};
          if (caps.focusMode && caps.focusMode.includes("continuous")) {
            track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
          }
        } catch(e) {}
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setReady(true);
      })
      .catch(err => {
        setError("Impossible d'accéder à la caméra : " + (err.message || "permission refusée"));
      });
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || capturing) return;
    setCapturing(true);
    // Petit délai pour laisser l'autofocus se stabiliser avant la capture
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { setCapturing(false); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result.split(",")[1];
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          onCapture({ base64, type: "image/jpeg", name: `Photo_Scan_${Date.now()}.jpg` });
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.95);
    }, 600);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10001,
      background:"#000", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
    }}>
      {error ? (
        <div style={{ color:"#fff", textAlign:"center", padding:24, maxWidth:340 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📷</div>
          <div style={{ fontSize:15, marginBottom:20, lineHeight:1.5 }}>{error}</div>
          <button onClick={onClose} style={{
            padding:"12px 24px", background:"#fff", color:"#000",
            border:"none", borderRadius:10, fontWeight:600, cursor:"pointer",
          }}>Fermer</button>
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted style={{
            width:"100%", height:"100%", objectFit:"cover",
          }} />
          <div style={{
            position:"absolute", top:24, left:0, right:0, textAlign:"center",
            color:"#fff", fontSize:13, fontFamily:"sans-serif",
            textShadow:"0 1px 4px rgba(0,0,0,0.6)", padding:"0 20px",
          }}>
            {capturing ? "📸 Capture en cours… ne bouge pas" : "Cadre bien le document et garde le téléphone stable"}
          </div>
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            padding:"24px 20px 36px", display:"flex",
            alignItems:"center", justifyContent:"space-between",
            background:"linear-gradient(transparent, rgba(0,0,0,0.6))",
          }}>
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,0.15)", border:"none", color:"#fff",
              width:44, height:44, borderRadius:"50%", fontSize:18, cursor:"pointer",
            }}>✕</button>
            <button onClick={handleCapture} disabled={!ready || capturing} style={{
              width:68, height:68, borderRadius:"50%",
              background: capturing ? "#FFD700" : "#fff", border:"4px solid rgba(255,255,255,0.4)",
              cursor: (ready && !capturing) ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.5,
              transition:"background 0.2s",
            }} />
            <div style={{ width:44 }} />
          </div>
        </>
      )}
    </div>
  );
}

function ScannerModal({ onClose, onImportToDashboard, onRequestCamera, onShowAuth, initialResults, authUser }) {
  const [phase, setPhase]       = useState(initialResults ? "result" : "upload");   // "upload" | "loading" | "result"

  useEffect(() => {
    if (phase === "auth-waiting") {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setPhase("result");
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && phase === "auth-waiting") setPhase("result");
      });
      return () => subscription.unsubscribe();
    }
  }, [phase]);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [animFrame, setAnimFrame] = useState(0);
  const [showClause, setShowClause]   = useState(false);
  const [showEmail, setShowEmail]     = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);
  const [copiedEmail, setCopiedEmail]   = useState(false);
  const [showProfessionaliser, setShowProfessionaliser] = useState(false);
  const [showComparatif, setShowComparatif] = useState(false);
  const [showExtractionMagique, setShowExtractionMagique] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showPhotoTooltip, setShowPhotoTooltip] = useState(false);
  const [photoScanning, setPhotoScanning] = useState(false);

  // ── Permission fichier style iOS ──
  const [filePermission, setFilePermission] = useState("prompt"); // "prompt" | "granted" | "denied"
  const [showFilePermModal, setShowFilePermModal] = useState(false);
  const fileInputRef = useRef(null);

  const requestFilePermission = () => {
    if (filePermission === "granted") {
      fileInputRef.current?.click();
    } else {
      setShowFilePermModal(true);
    }
  };

  const [fileData, setFileData] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setFileData(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clauseText = "Les droits d'exploitation ne seront transférés au Client qu'à compter du paiement intégral des honoraires dus par le Client.";
  const emailText  = "Bonjour, concernant l'article 4, étant en micro-entreprise, un délai de 60 jours est difficile pour ma trésorerie. Serait-il possible de passer sur un délai de 30 jours net à réception de facture ?";

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  const loadingMessages = [
    "Lecture du document PDF…",
    "Analyse des clauses par l'IA…",
    "Analyse de conformité & règles de projet…",
    "Génération du rapport…",
  ];

  const handleFakeFile = () => {
    requestFilePermission();
  };

  const [showRealCamera, setShowRealCamera] = useState(false);

  const handlePhotoScan = () => {
    const doScan = () => setShowRealCamera(true);
    if (onRequestCamera) {
      onRequestCamera(doScan);
    } else {
      doScan();
    }
  };

  const handleCameraCapture = ({ base64, type, name }) => {
    setShowRealCamera(false);
    setPhotoScanning(false);
    setFileName(name);
    setFileType(type);
    setFileData(base64);
  };

  const [aiFindings, setAiFindings] = useState(initialResults?.aiFindings || null);

  const handleAnalyse = async () => {
    if (!fileName || !fileData) return;
    setPhase("loading");
    setProgress(0); setAnimFrame(0);
    let current = 0; const total = 8000; const tick = 100;
    const interval = setInterval(() => {
      current += tick;
      setProgress(Math.min(90, Math.round((current/total)*90)));
      setAnimFrame(Math.min(loadingMessages.length-1, Math.floor((current/total)*loadingMessages.length)));
    }, tick);
    try {
      const mt = fileType && fileType.includes("pdf") ? "application/pdf" : (fileType || "image/jpeg");
      const isImg = mt.startsWith("image/");
      const src = isImg ? {type:"image",source:{type:"base64",media_type:mt,data:fileData}} : {type:"document",source:{type:"base64",media_type:"application/pdf",data:fileData}};
      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,messages:[{role:"user",content:[src,{type:"text",text:"Analyse ce contrat en francais. Identifie clauses dangereuses, a negocier et positives. JSON: {findings:[{level:danger|warning|ok,article:nom,text:explication}]} Max 6."}]}]})})
      const data = await res.json();
      const txt = (data.content||[]).map(i=>i.text||"").join("").trim();
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      const findings = parsed.findings||[];
      setAiFindings(findings);
      const existing = JSON.parse(localStorage.getItem("freeley_scan_list") || "[]");
      existing.unshift({ aiFindings: findings, extractedData: null, date: new Date().toLocaleDateString("fr-FR") });
      localStorage.setItem("freeley_scan_list", JSON.stringify(existing.slice(0, 10)));
      localStorage.setItem("freeley_scan_results", JSON.stringify({ aiFindings: findings, extractedData: null }));
    } catch(e) { setAiFindings(null); }
    clearInterval(interval); setProgress(100);
    await handleExtraction();
    setTimeout(()=>setPhase("result"),300);
  };

  const [extractedData, setExtractedData] = useState(initialResults?.extractedData || null);

  const handleExtraction = async () => {
    if (!fileData) return;
    try {
      const mt = fileType && fileType.includes("pdf") ? "application/pdf" : (fileType || "image/jpeg");
      const isImg = mt.startsWith("image/");
      const src = isImg ? {type:"image",source:{type:"base64",media_type:mt,data:fileData}} : {type:"document",source:{type:"base64",media_type:"application/pdf",data:fileData}};
      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:800,messages:[{role:"user",content:[src,{type:"text",text:"Extrait les infos cles de ce contrat. Reponds UNIQUEMENT en JSON: {client:string,mission:string,montant:string,acompte:string,dates:string}"}]}]})});
      const data = await res.json();
      const txt = (data.content||[]).map(i=>i.text||"").join("").trim();
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      setExtractedData(parsed);
      const existingRes = JSON.parse(localStorage.getItem("freeley_scan_results") || "{}");
      const updatedRes = { ...existingRes, extractedData: parsed };
      localStorage.setItem("freeley_scan_results", JSON.stringify(updatedRes));
      const scanList = JSON.parse(localStorage.getItem("freeley_scan_list") || "[]");
      if (scanList.length > 0) { scanList[0] = updatedRes; localStorage.setItem("freeley_scan_list", JSON.stringify(scanList)); }
    } catch(e) { setExtractedData(null); }
  };

  const findings = [
    {
      level: "danger",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      dot: "#EF4444",
      label: "DANGER",
      labelBg: "#FEE2E2",
      labelColor: "#991B1B",
      icon: "🔴",
      article: "Article 6 — Propriété Intellectuelle",
      text: "Le client s'approprie vos droits avant le paiement complet. Toute cession de droits doit être conditionnée au règlement intégral de la prestation.",
    },
    {
      level: "warning",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      dot: "#F59E0B",
      label: "À NÉGOCIER",
      labelBg: "#FEF3C7",
      labelColor: "#92400E",
      icon: "🟡",
      article: "Article 4 — Rémunération",
      text: "Le délai de paiement est fixé à 60 jours. Essayez d'obtenir 30 jours net — c'est le délai standard en France pour les prestations B2B (art. L441-10 C.com.).",
    },
    {
      level: "ok",
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      dot: "#22C55E",
      label: "CONFORME",
      labelBg: "#DCFCE7",
      labelColor: "#166534",
      icon: "🟢",
      article: "Article 9 — Résiliation",
      text: "La clause est parfaitement équitable pour les deux parties. Un préavis de 15 jours est prévu de chaque côté, sans pénalité en cas de résiliation à l'amiable.",
    },
  ];

  const scoreColor  = "#D97706";
  const scoreBg     = "#FFFBEB";
  const scoreBorder = "#FDE68A";

  const downloadScanPDF = (overrideFindings) => {
    const findings = overrideFindings || aiFindings;
    if (!findings || !findings.length) { alert("Aucun résultat à télécharger."); return; }
    if (!window.jspdf) { alert("PDF en cours de chargement, réessaie."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = 210, ML = 22, MR = 22, cw = PW - ML - MR;
    const NAVY = [26, 54, 93], GOLD = [180, 140, 70], DARK = [44, 62, 80];
    const DANGER = [200, 60, 60], WARN = [200, 150, 40], OK = [39, 119, 63];
    const today = new Date().toLocaleDateString("fr-FR");
    let y = 20;

    doc.setFillColor(...NAVY); doc.rect(0, 0, PW, 32, "F");
    doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(0, 32, PW, 32);
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(255,255,255);
    doc.text("Rapport d'analyse de contrat", ML, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200,215,235);
    doc.text(`Généré le ${today} via Freeley — analyse IA`, ML, 24);

    y = 46;
    findings.forEach((f, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      const color = f.level === "danger" ? DANGER : f.level === "warning" ? WARN : OK;
      const label = f.level === "danger" ? "RISQUE" : f.level === "warning" ? "À NÉGOCIER" : "POSITIF";
      doc.setFillColor(...color); doc.roundedRect(ML, y, 28, 6, 1, 1, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255,255,255);
      doc.text(label, ML + 14, y + 4, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...DARK);
      doc.text(f.article || `Point ${i+1}`, ML + 32, y + 4.5);
      y += 10;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(80,80,80);
      const lines = doc.splitTextToSize(f.text || "", cw);
      doc.text(lines, ML, y);
      y += lines.length * 4.6 + 8;
    });

    doc.save(`Analyse_Contrat_Freeley_${Date.now()}.pdf`);
  };

  return (
    <>
    {showRealCamera && (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowRealCamera(false)}
      />
    )}
    {/* ── Input fichier caché ── */}
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
      style={{ display:"none" }}
      onChange={handleFileSelected}
    />

    {/* ── Popup permission accès fichiers (style iOS) ── */}
    {showFilePermModal && (
      <div style={{
        position:"fixed", inset:0, zIndex:10001,
        background:"rgba(0,0,0,0.45)", backdropFilter:"blur(5px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
      }}>
        <div style={{
          background:"#F2F2F7",
          borderRadius:14,
          width:"100%", maxWidth:290,
          boxShadow:"0 24px 64px rgba(0,0,0,0.35)",
          overflow:"hidden",
          animation:"cameraPopIn 0.32s cubic-bezier(.22,.68,0,1.2) both",
          fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
        }}>
          {/* Icon + Titre + Texte */}
          <div style={{ padding:"24px 20px 20px", textAlign:"center" }}>
            <div style={{
              width:56, height:56, borderRadius:14,
              background:"linear-gradient(145deg, #1C1C1E 0%, #2C2C2E 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 14px",
              boxShadow:"0 4px 14px rgba(0,0,0,0.22)",
            }}>
              <span style={{ fontSize:28 }}>📁</span>
            </div>
            <div style={{
              fontSize:17, fontWeight:600, color:"#1C1C1E",
              letterSpacing:"-0.02em", lineHeight:1.3, marginBottom:10,
            }}>
              « Freeley » souhaite accéder à vos fichiers
            </div>
            <div style={{
              fontSize:13, color:"#48484A",
              lineHeight:1.55, letterSpacing:"-0.01em",
            }}>
              Cette autorisation permet à l'application d'analyser votre contrat PDF ou Word afin d'en détecter les clauses et risques grâce à notre assistant IA.
            </div>
          </div>

          {/* Séparateur */}
          <div style={{ height:1, background:"#C6C6C8" }} />

          {/* Boutons façon alerte iOS */}
          <div style={{ display:"flex" }}>
            <button
              onClick={() => {
                setShowFilePermModal(false);
                setFilePermission("denied");
              }}
              style={{
                flex:1, padding:"14px 10px",
                background:"transparent", border:"none",
                borderRight:"1px solid #C6C6C8",
                cursor:"pointer",
                fontSize:17, fontWeight:400, color:"#007AFF",
                fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
                letterSpacing:"-0.01em", transition:"background 0.12s",
              }}
              onMouseOver={e=>e.currentTarget.style.background="#E5E5EA"}
              onMouseOut={e=>e.currentTarget.style.background="transparent"}
            >
              Refuser
            </button>
            <button
              onClick={() => {
                setFilePermission("granted");
                setShowFilePermModal(false);
                // Petit délai pour que le modal se ferme avant l'ouverture de l'explorateur
                setTimeout(() => fileInputRef.current?.click(), 80);
              }}
              style={{
                flex:1, padding:"14px 10px",
                background:"transparent", border:"none",
                cursor:"pointer",
                fontSize:17, fontWeight:600, color:"#007AFF",
                fontFamily:"-apple-system, 'SF Pro Display', 'DM Sans', system-ui, sans-serif",
                letterSpacing:"-0.01em", transition:"background 0.12s",
              }}
              onMouseOver={e=>e.currentTarget.style.background="#E5E5EA"}
              onMouseOut={e=>e.currentTarget.style.background="transparent"}
            >
              Autoriser
            </button>
          </div>
        </div>
      </div>
    )}

    <div
      style={{
        position:"fixed", inset:0, background:"#00000065", zIndex:400,
        display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:"20px 16px", overflowY:"auto",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:16, width:"100%", maxWidth:520,
        boxShadow:"0 32px 80px #00000030", overflow:"hidden",
        marginTop:16, marginBottom:16,
      }}>

        {/* ── Header ── */}
        <div style={{
          background:C.navy, padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#EFF6FF", borderRadius:8,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🔍</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:17, color:C.white, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                Scanner un contrat
                <span style={{ fontSize:14 }}>✨📷</span>
                <div style={{ position:"relative", display:"inline-flex" }}>
                  <button
                    onClick={() => setShowPhotoTooltip(v => !v)}
                    style={{
                      width:18, height:18, borderRadius:"50%",
                      background:"#3B5A82", border:"1px solid #5A7BA0",
                      color:"#A8C4E0", fontSize:10, fontWeight:700,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, lineHeight:1,
                    }}
                  >i</button>
                  {showPhotoTooltip && (
                    <div style={{
                      position:"absolute", top:24, left:"50%", transform:"translateX(-50%)",
                      background:"#1A2F4A", border:"1px solid #3B5A82",
                      borderRadius:10, padding:"12px 14px",
                      width:240, zIndex:999,
                      boxShadow:"0 8px 24px #00000040",
                    }}>
                      <div style={{ fontFamily:T.body, fontSize:11.5, color:"#CBD5E1", lineHeight:1.65 }}>
                        Pas de fichier PDF ? Prenez simplement en photo les pages d'un contrat papier ou d'un écran. L'IA se charge de numériser et d'analyser le texte automatiquement.
                      </div>
                      <div
                        onClick={() => setShowPhotoTooltip(false)}
                        style={{
                          position:"absolute", top:8, right:10,
                          fontSize:12, color:"#8BA3C0", cursor:"pointer",
                        }}
                      >✕</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#8BA3C0", marginTop:1 }}>Analyse IA · Vérification de conformité & points de négociation</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:"50%", background:"#253D5E",
            border:"none", color:"#8BA3C0", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>✕</button>
        </div>

        <div style={{ padding:"24px 24px 20px" }}>

          {/* ════════════ PHASE UPLOAD ════════════ */}
          {phase === "upload" && (
            <>
              {/* Zone de dépôt */}
              <div style={{
                border:`2px dashed ${fileName ? "#86EFAC" : C.border}`,
                borderRadius:12, padding:"36px 24px",
                background: fileName ? "#F0FDF4" : C.creamD,
                textAlign:"center", marginBottom:20,
                transition:"all 0.2s",
              }}>
                {!fileName ? (
                  <>
                    <div style={{ fontSize:36, marginBottom:12 }}>{photoScanning ? "🧠" : "📄"}</div>
                    {photoScanning ? (
                      <>
                        <div style={{ fontFamily:T.display, fontSize:16, color:C.navy, fontWeight:600, marginBottom:6 }}>
                          Numérisation et analyse des clauses...
                        </div>
                        <div style={{ fontFamily:T.body, fontSize:12, color:"#3B7DD8", animation:"shimmer 1.2s ease-in-out infinite" }}>
                          🧠 L'IA traite les pages photographiées…
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontFamily:T.display, fontSize:16, color:C.navy, fontWeight:600, marginBottom:6 }}>
                          Dépose ton contrat ici
                        </div>
                        <p style={{ fontFamily:T.body, fontSize:12, color:C.textL, marginBottom:18, lineHeight:1.6 }}>
                          Formats acceptés : PDF, DOCX, TXT<br/>Taille max : 10 Mo
                        </p>
                        <button
                          onClick={handleFakeFile}
                          style={{
                            padding:"11px 24px",
                            background:C.navy, color:C.white,
                            border:"none", borderRadius:8,
                            cursor:"pointer", fontSize:13,
                            fontFamily:T.body, fontWeight:600,
                            display:"inline-flex", alignItems:"center", gap:8,
                            boxShadow:"0 4px 14px #1B2E4B28",
                            transition:"all 0.18s",
                          }}
                          onMouseOver={e=>{ e.currentTarget.style.background="#152438"; e.currentTarget.style.transform="translateY(-1px)"; }}
                          onMouseOut={e=>{ e.currentTarget.style.background=C.navy; e.currentTarget.style.transform="translateY(0)"; }}
                        >
                          <span style={{ fontSize:15 }}>📁</span>
                          Sélectionner un contrat PDF
                        </button>
                        <div style={{ marginTop:14 }}>
                          <button
                            onClick={handlePhotoScan}
                            style={{
                              background:"none", border:"none",
                              cursor:"pointer", fontFamily:T.body,
                              fontSize:12, color:"#3B7DD8",
                              display:"inline-flex", alignItems:"center", gap:5,
                              padding:"4px 8px", borderRadius:6,
                              transition:"background 0.15s",
                            }}
                            onMouseOver={e=>{ e.currentTarget.style.background="#EFF6FF"; }}
                            onMouseOut={e=>{ e.currentTarget.style.background="none"; }}
                          >
                            📷 Prendre une photo des pages
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
                    <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:"#15803D", marginBottom:4 }}>
                      Fichier sélectionné
                    </div>
                    <div style={{
                      display:"inline-flex", alignItems:"center", gap:8,
                      background:C.white, border:"1px solid #BBF7D0",
                      borderRadius:8, padding:"8px 16px",
                      fontFamily:T.body, fontSize:13, color:C.navy,
                    }}>
                      <span style={{ fontSize:16 }}>📄</span>
                      {fileName}
                      <span
                        onClick={() => setFileName("")}
                        style={{ fontSize:12, color:C.textL, cursor:"pointer", marginLeft:4 }}
                        title="Retirer"
                      >✕</span>
                    </div>
                  </>
                )}
              </div>

              {/* Info banner */}
              <div style={{
                background:"#EFF6FF", border:"1px solid #BFDBFE",
                borderRadius:8, padding:"10px 14px", marginBottom:20,
                fontFamily:T.body, fontSize:12, color:"#1E40AF", lineHeight:1.6,
                display:"flex", gap:8, alignItems:"flex-start",
              }}>
                <span style={{ fontSize:14, flexShrink:0 }}>ℹ️</span>
                <span>L'IA analyse chaque article pour détecter les anomalies, les oublis et les points de négociation commerciale avant signature.</span>
              </div>

              {/* CTA */}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={onClose} style={{
                  flex:1, padding:"12px", background:C.creamD, border:`1px solid ${C.border}`,
                  borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:T.body, color:C.textM,
                }}>Annuler</button>
                <button
                  onClick={handleAnalyse}
                  disabled={!fileName}
                  style={{
                    flex:2, padding:"12px",
                    background: fileName ? C.navy : C.creamDD,
                    color: fileName ? C.white : C.textL,
                    border:"none", borderRadius:8,
                    cursor: fileName ? "pointer" : "not-allowed",
                    fontSize:13, fontFamily:T.body, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow: fileName ? "0 4px 14px #1B2E4B28" : "none",
                    transition:"all 0.18s",
                  }}
                  onMouseOver={e=>{ if(fileName){ e.currentTarget.style.background="#152438"; }}}
                  onMouseOut={e=>{ if(fileName){ e.currentTarget.style.background=C.navy; }}}
                >
                  <span style={{ fontSize:15 }}>✦</span>
                  Lancer l'analyse
                </button>
              </div>
            </>
          )}

          {/* ════════════ PHASE LOADING ════════════ */}
          {phase === "loading" && (
            <div style={{ textAlign:"center", padding:"20px 0 12px" }}>
              {/* Animated icon */}
              <div style={{
                width:64, height:64, borderRadius:16,
                background:"#EFF6FF", margin:"0 auto 20px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28,
                animation:"shimmer 1.2s ease-in-out infinite",
              }}>🔍</div>

              <div style={{ fontFamily:T.display, fontSize:20, color:C.navy, fontWeight:600, marginBottom:6 }}>
                Analyse en cours…
              </div>
              <div style={{
                fontFamily:T.body, fontSize:13, color:"#3B7DD8",
                marginBottom:28, minHeight:20,
                animation:"fadeUp 0.3s ease both",
                key: animFrame,
              }}>
                {loadingMessages[animFrame]}
              </div>

              {/* Progress bar */}
              <div style={{
                background:C.creamDD, borderRadius:8, height:10,
                overflow:"hidden", marginBottom:10,
              }}>
                <div style={{
                  height:"100%", borderRadius:8,
                  background:`linear-gradient(90deg, ${C.navy}, #3B7DD8)`,
                  width:`${progress}%`,
                  transition:"width 0.1s linear",
                  boxShadow:"0 0 8px #3B7DD840",
                }} />
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>{progress}%</div>

              {/* Articles animés */}
              <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:6, textAlign:"left" }}>
                {["Art. 1 — Objet", "Art. 4 — Rémunération", "Art. 6 — Propriété intellectuelle", "Art. 9 — Résiliation"].map((art, i) => {
                  const articleProgress = (i + 1) * 25;
                  const done = progress >= articleProgress;
                  const active = progress >= articleProgress - 24 && progress < articleProgress;
                  return (
                    <div key={art} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"8px 12px",
                      background: done ? "#F0FDF4" : active ? "#EFF6FF" : C.creamD,
                      border:`1px solid ${done ? "#BBF7D0" : active ? "#BFDBFE" : C.borderL}`,
                      borderRadius:7,
                      opacity: progress >= articleProgress - 24 ? 1 : 0.35,
                      transition:"all 0.4s ease",
                    }}>
                      <div style={{
                        width:18, height:18, borderRadius:"50%", flexShrink:0,
                        background: done ? "#16A34A" : active ? "#3B7DD8" : C.creamDD,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:8, color:C.white, fontWeight:700,
                        transition:"background 0.3s",
                      }}>
                        {done ? "✓" : active ? (
                          <span style={{ width:7, height:7, border:"1.5px solid white", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.6s linear infinite" }}/>
                        ) : i + 1}
                      </div>
                      <span style={{ fontFamily:T.body, fontSize:12, fontWeight:500, color: done ? "#15803D" : active ? "#1D4ED8" : C.textL }}>
                        {art}
                      </span>
                      {done && <span style={{ fontFamily:T.body, fontSize:10, color:"#16A34A", marginLeft:"auto" }}>Analysé ✓</span>}
                      {active && <span style={{ fontFamily:T.body, fontSize:10, color:"#3B7DD8", marginLeft:"auto", animation:"shimmer 1s ease-in-out infinite" }}>En cours…</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════ PHASE AUTH REQUIRED ════════════ */}
          {phase === "auth-required" && (
            <div style={{ padding:"40px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
              <h3 style={{ fontFamily:"Georgia, serif", fontSize:20, color:"#1B2E4B", marginBottom:8 }}>
                Créez un compte pour voir le résultat
              </h3>
              <p style={{ fontFamily:"sans-serif", fontSize:13, color:"#8A8780", marginBottom:24, lineHeight:1.6 }}>
                Votre contrat a été analysé par l'IA. Créez un compte gratuit pour accéder au rapport complet.
              </p>
              <button onClick={() => { onClose(); }} style={{
                width:"100%", padding:"14px", background:"#1B2E4B", color:"white",
                border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10
              }}>
                Créer un compte gratuit
              </button>
              <button onClick={() => setPhase("upload")} style={{
                width:"100%", padding:"12px", background:"none", color:"#8A8780",
                border:"1.5px solid #D8D4CB", borderRadius:12, fontSize:13, cursor:"pointer"
              }}>
                Retour
              </button>
            </div>
          )}

          {/* ════════════ PHASE RESULT ════════════ */}
          {phase === "result" && (
            <>
              {/* Score global */}
              <div style={{
                display:"flex", alignItems:"center", gap:16,
                background:scoreBg, border:`1px solid ${scoreBorder}`,
                borderRadius:12, padding:"16px 20px", marginBottom:20,
              }}>
                <div style={{
                  width:56, height:56, borderRadius:12, flexShrink:0,
                  background:C.white, border:`2px solid ${scoreBorder}`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 2px 8px #D9770620",
                }}>
                  <div style={{ fontFamily:T.display, fontSize:22, fontWeight:700, color:scoreColor, lineHeight:1 }}>6</div>
                  <div style={{ fontFamily:T.body, fontSize:8, color:scoreColor, fontWeight:600, letterSpacing:"0.05em" }}>/10</div>
                </div>
                <div>
                  <div style={{ fontFamily:T.display, fontSize:16, color:C.navy, fontWeight:600, marginBottom:3 }}>
                    Contrat risqué — révision recommandée
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.5 }}>
                    <strong>1 clause dangereuse</strong> détectée · 1 point à renégocier · 1 clause conforme
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {(aiFindings ? aiFindings.map(f => ({
                  ...f,
                  color: f.level === "danger" ? "#DC2626" : f.level === "warning" ? "#D97706" : "#16A34A",
                  bg: f.level === "danger" ? "#FEF2F2" : f.level === "warning" ? "#FFFBEB" : "#F0FDF4",
                  border: f.level === "danger" ? "#FECACA" : f.level === "warning" ? "#FDE68A" : "#BBF7D0",
                  dot: f.level === "danger" ? "#EF4444" : f.level === "warning" ? "#F59E0B" : "#22C55E",
                  label: f.level === "danger" ? "DANGER" : f.level === "warning" ? "A NEGOCIER" : "CONFORME",
                  labelBg: f.level === "danger" ? "#FEE2E2" : f.level === "warning" ? "#FEF3C7" : "#DCFCE7",
                  labelColor: f.level === "danger" ? "#991B1B" : f.level === "warning" ? "#92400E" : "#166534",
                  icon: f.level === "danger" ? "🔴" : f.level === "warning" ? "🟡" : "🟢",
                })) : findings).map((f, i) => (
                  <div key={i} className="fade-up" style={{
                    background:f.bg, border:`1.5px solid ${f.border}`,
                    borderRadius:10, padding:"14px 16px",
                    animation:`fadeUp 0.4s ${i * 0.1}s both cubic-bezier(.22,.68,0,1.2)`,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      {/* Colored dot */}
                      <div style={{
                        width:10, height:10, borderRadius:"50%",
                        background:f.dot, flexShrink:0,
                        boxShadow:`0 0 0 3px ${f.dot}30`,
                      }} />
                      {/* Level badge */}
                      <span style={{
                        fontFamily:T.body, fontSize:9, fontWeight:700,
                        letterSpacing:"0.1em", padding:"2px 8px",
                        background:f.labelBg, color:f.labelColor,
                        borderRadius:20,
                      }}>{f.label}</span>
                      {/* Article name */}
                      <span style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:f.color }}>
                        {f.article}
                      </span>
                    </div>
                    <p style={{
                      fontFamily:T.body, fontSize:12, color:C.textM,
                      lineHeight:1.65, margin:0, paddingLeft:20,
                    }}>
                      {f.text}
                    </p>

                    {/* ── Solution 1 clic : DANGER → Clause corrective ── */}
                    {f.level === "danger" && (
                      <div style={{ marginTop:12, paddingLeft:20 }}>
                        <button
                          onClick={() => setShowClause(v => !v)}
                          style={{
                            display:"inline-flex", alignItems:"center", gap:6,
                            padding:"6px 12px",
                            background: showClause ? "#FEE2E2" : C.white,
                            border:`1.5px solid #FECACA`,
                            borderRadius:20, cursor:"pointer",
                            fontFamily:T.body, fontSize:11, fontWeight:600,
                            color:"#DC2626", transition:"all 0.18s",
                          }}
                          onMouseOver={e => e.currentTarget.style.background="#FEE2E2"}
                          onMouseOut={e => e.currentTarget.style.background= showClause ? "#FEE2E2" : C.white}
                        >
                          💡 Voir la clause corrective
                        </button>

                        {showClause && (
                          <div style={{
                            marginTop:10,
                            background:"#F3F4F6", border:"1.5px solid #E5E7EB",
                            borderRadius:10, padding:"14px 14px 12px",
                            animation:"fadeUp 0.25s ease both",
                          }}>
                            <p style={{
                              fontFamily:T.body, fontSize:12, color:"#374151",
                              lineHeight:1.65, margin:"0 0 10px", fontStyle:"italic",
                            }}>
                              « {clauseText} »
                            </p>
                            <button
                              onClick={() => handleCopy(clauseText, setCopiedClause)}
                              style={{
                                display:"inline-flex", alignItems:"center", gap:6,
                                padding:"7px 14px",
                                background: copiedClause ? "#16A34A" : C.navy,
                                color:C.white, border:"none",
                                borderRadius:8, cursor:"pointer",
                                fontFamily:T.body, fontSize:11, fontWeight:700,
                                transition:"all 0.2s",
                              }}
                            >
                              {copiedClause ? "✓ Copié !" : "📋 Copier"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Solution 1 clic : WARNING → Message de négociation ── */}
                    {f.level === "warning" && (
                      <div style={{ marginTop:12, paddingLeft:20 }}>
                        <button
                          onClick={() => setShowEmail(v => !v)}
                          style={{
                            display:"inline-flex", alignItems:"center", gap:6,
                            padding:"6px 12px",
                            background: showEmail ? "#FEF3C7" : C.white,
                            border:`1.5px solid #FDE68A`,
                            borderRadius:20, cursor:"pointer",
                            fontFamily:T.body, fontSize:11, fontWeight:600,
                            color:"#D97706", transition:"all 0.18s",
                          }}
                          onMouseOver={e => e.currentTarget.style.background="#FEF3C7"}
                          onMouseOut={e => e.currentTarget.style.background= showEmail ? "#FEF3C7" : C.white}
                        >
                          ✉️ Message de négociation pour le client
                        </button>

                        {showEmail && (
                          <div style={{
                            marginTop:10,
                            background:"#F3F4F6", border:"1.5px solid #E5E7EB",
                            borderRadius:10, padding:"14px 14px 12px",
                            animation:"fadeUp 0.25s ease both",
                          }}>
                            <p style={{
                              fontFamily:T.body, fontSize:12, color:"#374151",
                              lineHeight:1.65, margin:"0 0 10px", fontStyle:"italic",
                            }}>
                              « {emailText} »
                            </p>
                            <button
                              onClick={() => handleCopy(emailText, setCopiedEmail)}
                              style={{
                                display:"inline-flex", alignItems:"center", gap:6,
                                padding:"7px 14px",
                                background: copiedEmail ? "#16A34A" : C.navy,
                                color:C.white, border:"none",
                                borderRadius:8, cursor:"pointer",
                                fontFamily:T.body, fontSize:11, fontWeight:700,
                                transition:"all 0.2s",
                              }}
                            >
                              {copiedEmail ? "✓ Copié !" : "📋 Copier"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Bouton télécharger PDF du rapport de scan */}
              <button
                onClick={() => downloadScanPDF()}
                style={{
                  width:"100%", padding:"12px 16px", marginBottom:20,
                  background:C.gold, color:C.navyD, border:"none",
                  borderRadius:10, cursor:"pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}
              >⬇ Télécharger le rapport PDF</button>

              {/* ════ SECTION PROFESSIONNALISER ════ */}
              <div style={{
                background:"linear-gradient(135deg, #0F1C2D 0%, #1B2E4B 60%, #2A3F6B 100%)",
                borderRadius:14, padding:"20px 20px 18px", marginBottom:20,
                border:"1.5px solid #2A4167",
                boxShadow:"0 4px 24px #1B2E4B30",
                position:"relative", overflow:"hidden",
              }}>
                {/* Subtle glow accent */}
                <div style={{
                  position:"absolute", top:-30, right:-30,
                  width:120, height:120, borderRadius:"50%",
                  background:"radial-gradient(circle, #7C3AED22 0%, transparent 70%)",
                  pointerEvents:"none",
                }} />

                {/* Title */}
                <div style={{ fontFamily:T.display, fontSize:15, fontWeight:700, color:"#FFFFFF", marginBottom:14 }}>
                  Pourquoi professionnaliser votre contrat ? 🛡️
                </div>

                {/* 3 bullet points */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                  {[
                    { icon:"⚖️", label:"Sécurité contractuelle", desc:"Vos clauses floues sont reformulées avec les termes exacts du droit français." },
                    { icon:"💼", label:"Crédibilité maximale", desc:"Présentez un document irréprochable qui rassure vos clients et accélère la signature." },
                    { icon:"⚡", label:"Zéro effort", desc:"L'IA s'occupe de la structure, vous gardez 100% du contrôle sur vos prix et vos délais." },
                  ].map((item, i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{
                        width:30, height:30, borderRadius:8, flexShrink:0,
                        background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:14,
                      }}>{item.icon}</div>
                      <div>
                        <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#E2E8F0", marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontFamily:T.body, fontSize:11, color:"#94A3B8", lineHeight:1.55 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => { setShowComparatif(v => !v); setShowProfessionaliser(true); }}
                  style={{
                    width:"100%", padding:"13px 16px",
                    background: showComparatif
                      ? "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)"
                      : "linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%)",
                    color:"#FFFFFF", border:"none", borderRadius:10, cursor:"pointer",
                    fontFamily:T.body, fontSize:14, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow:"0 4px 20px #7C3AED50",
                    transition:"all 0.2s",
                    letterSpacing:"0.01em",
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 28px #7C3AED60"; }}
                  onMouseOut={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px #7C3AED50"; }}
                >
                  <span style={{ fontSize:16 }}>✨</span>
                  {showComparatif ? "Masquer l'aperçu" : "Professionnaliser mon contrat avec l'IA"}
                </button>
              </div>

              {/* ════ COMPARATIF AVANT / APRÈS ════ */}
              {showComparatif && (
                <div className="fade-up" style={{
                  background:C.white, border:`1.5px solid #DDD6FE`,
                  borderRadius:14, overflow:"hidden", marginBottom:20,
                  boxShadow:"0 4px 24px #7C3AED14",
                  animation:"fadeUp 0.35s cubic-bezier(.22,.68,0,1.2) both",
                }}>
                  {/* Header comparatif */}
                  <div style={{
                    background:"linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
                    padding:"12px 18px", borderBottom:"1px solid #DDD6FE",
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span style={{ fontSize:14 }}>🔄</span>
                    <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#5B21B6" }}>
                      Aperçu — Transformation en direct
                    </div>
                    <div style={{
                      marginLeft:"auto", background:"#7C3AED", color:"#FFFFFF",
                      fontFamily:T.body, fontSize:9, fontWeight:700, letterSpacing:"0.08em",
                      padding:"3px 8px", borderRadius:20,
                    }}>DEMO</div>
                  </div>

                  <div style={{ padding:"16px 18px" }}>
                    {/* Colonnes Avant / Après */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:12 }}>

                      {/* AVANT */}
                      <div>
                        <div style={{
                          display:"flex", alignItems:"center", gap:6, marginBottom:10,
                        }}>
                          <div style={{
                            width:8, height:8, borderRadius:"50%", background:"#EF4444", flexShrink:0,
                          }} />
                          <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:"#DC2626", letterSpacing:"0.08em" }}>VOTRE TEXTE BRUT</div>
                        </div>
                        <div style={{
                          background:"#FEF2F2", border:"1.5px solid #FECACA",
                          borderRadius:8, padding:"12px 14px", minHeight:120,
                        }}>
                          <p style={{
                            fontFamily:T.body, fontSize:11.5, color:"#374151",
                            lineHeight:1.7, margin:0, fontStyle:"italic",
                          }}>
                            « Le client doit me payer vite à la fin de la mission. »
                          </p>
                          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:5 }}>
                            {[
                              { text:"Délai flou", icon:"⚠️" },
                              { text:"Sans référence réglementaire", icon:"⚠️" },
                              { text:"Aucune pénalité prévue", icon:"⚠️" },
                            ].map((tag, i) => (
                              <div key={i} style={{
                                display:"inline-flex", alignItems:"center", gap:4,
                                background:"#FEE2E2", borderRadius:5, padding:"3px 8px",
                                fontFamily:T.body, fontSize:10, color:"#DC2626", fontWeight:600,
                              }}>{tag.icon} {tag.text}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* APRÈS */}
                      <div>
                        <div style={{
                          display:"flex", alignItems:"center", gap:6, marginBottom:10,
                        }}>
                          <div style={{
                            width:8, height:8, borderRadius:"50%", background:"#16A34A", flexShrink:0,
                          }} />
                          <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:"#16A34A", letterSpacing:"0.08em" }}>VERSION PROFESSIONNELLE</div>
                        </div>
                        <div style={{
                          background:"#F0FDF4", border:"1.5px solid #86EFAC",
                          borderRadius:8, padding:"12px 14px", minHeight:120,
                          position:"relative",
                        }}>
                          <p style={{
                            fontFamily:T.body, fontSize:11, color:"#1A1A1A",
                            lineHeight:1.7, margin:0,
                          }}>
                            <span style={{ fontWeight:700, color:"#15803D" }}>Conformément à l'art. L. 441-10 du Code de commerce,</span> les pénalités de retard sont exigibles dès le lendemain de la date d'échéance, au taux de 3× le taux directeur en vigueur.
                          </p>
                          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:5 }}>
                            {[
                              { text:"Référence réglementaire", icon:"✅" },
                              { text:"Pénalités chiffrées", icon:"✅" },
                              { text:"Opposable en justice", icon:"✅" },
                            ].map((tag, i) => (
                              <div key={i} style={{
                                display:"inline-flex", alignItems:"center", gap:4,
                                background:"#DCFCE7", borderRadius:5, padding:"3px 8px",
                                fontFamily:T.body, fontSize:10, color:"#16A34A", fontWeight:600,
                              }}>{tag.icon} {tag.text}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Flèche centrale */}
                    <div style={{ textAlign:"center", marginTop:14 }}>
                      <div style={{
                        display:"inline-flex", alignItems:"center", gap:8,
                        background:"linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%)",
                        color:"#FFFFFF", fontFamily:T.body, fontSize:11, fontWeight:700,
                        borderRadius:20, padding:"8px 18px",
                        boxShadow:"0 4px 14px #7C3AED40",
                      }}>
                        <span>✨</span>
                        L'IA transforme chaque clause en moins de 30 secondes
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                background:C.creamD, borderRadius:8, padding:"10px 14px", marginBottom:20,
                fontFamily:T.body, fontSize:11, color:C.textL, lineHeight:1.6,
              }}>
                ⚖ Analyse à titre indicatif. Pour un contrat à fort enjeu, consultez un juriste spécialisé.
              </div>

              {/* ════ EXTRACTION MAGIQUE ════ */}
              <div className="fade-up" style={{
                background:"linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 60%, #FAF5FF 100%)",
                border:"1.5px solid #C4B5FD",
                borderRadius:16, overflow:"hidden", marginBottom:20,
                boxShadow:"0 6px 28px #7C3AED18",
                animation:"fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both",
              }}>
                {/* Header extraction */}
                <div style={{
                  background:"linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                  padding:"16px 20px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div>
                    <div style={{ fontFamily:T.display, fontSize:16, fontWeight:700, color:"#FFFFFF", marginBottom:3 }}>
                      🪄 Extraction magique des données
                    </div>
                    <div style={{ fontFamily:T.body, fontSize:11, color:"#C4B5FD", lineHeight:1.5 }}>
                      L'IA a détecté et extrait automatiquement les informations clés de votre document pour créer votre suivi interactif :
                    </div>
                  </div>
                  <div style={{
                    width:40, height:40, borderRadius:10, flexShrink:0,
                    background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>🪄</div>
                </div>

                {/* Données extraites */}
                <div style={{ padding:"18px 20px 4px" }}>
                  <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:"#6D28D9", marginBottom:14 }}>
                    DONNÉES DÉTECTÉES PAR L'IA
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                    {[
                      { icon:"👤", label:"Client détecté", value: extractedData?.client || "Non détecté", color:"#5B21B6", bg:"#EDE9FE", border:"#C4B5FD" },
                      { icon:"💼", label:"Type de mission", value: extractedData?.mission || "Non détecté", color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE" },
                      { icon:"💰", label:"Montant global", value: extractedData?.montant || "Non détecté", color:"#166534", bg:"#F0FDF4", border:"#86EFAC" },
                      { icon:"💳", label:"Acompte requis (30%)", value: extractedData?.acompte || "Non détecté", color:"#92400E", bg:"#FFFBEB", border:"#FDE68A" },
                      { icon:"📅", label:"Dates de la mission", value: extractedData?.dates || "Non détecté", color:"#0F4C75", bg:"#F0F9FF", border:"#BAE6FD" },
                    ].map((field, i) => (
                      <div key={i} style={{
                        display:"flex", alignItems:"center", gap:12,
                        background:"#FFFFFF", border:`1.5px solid ${field.border}`,
                        borderRadius:10, padding:"11px 14px",
                        animation:`fadeUp 0.35s ${i * 0.07}s both cubic-bezier(.22,.68,0,1.2)`,
                        position:"relative", overflow:"hidden",
                      }}>
                        {/* Accent bar left */}
                        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:field.border, borderRadius:"10px 0 0 10px" }} />
                        {/* Icon badge */}
                        <div style={{
                          width:34, height:34, borderRadius:8, flexShrink:0,
                          background:field.bg, border:`1px solid ${field.border}`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                        }}>{field.icon}</div>
                        {/* Label + Value */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.textL, letterSpacing:"0.08em", marginBottom:2 }}>
                            {field.label.toUpperCase()}
                          </div>
                          <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:field.color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {field.value}
                          </div>
                        </div>
                        {/* Lock icon */}
                        <div style={{
                          width:22, height:22, borderRadius:6, flexShrink:0,
                          background:field.bg, border:`1px solid ${field.border}`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
                        }}>🔒</div>
                      </div>
                    ))}
                  </div>

                  {/* Info note */}
                  <div style={{
                    display:"flex", alignItems:"flex-start", gap:8,
                    background:"rgba(124,58,237,0.06)", border:"1px solid #DDD6FE",
                    borderRadius:8, padding:"10px 12px", marginBottom:18,
                    fontFamily:T.body, fontSize:11, color:"#5B21B6", lineHeight:1.55,
                  }}>
                    <span style={{ fontSize:13, flexShrink:0 }}>✨</span>
                    <span>Ces données seront automatiquement intégrées dans votre tableau de bord Freeley pour un suivi en temps réel.</span>
                  </div>
                </div>

                {/* Grand bouton d'import */}
                <div style={{ padding:"0 20px 20px" }}>
                  {!authUser && (
                    <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE", borderRadius:10, padding:"12px 16px", marginBottom:12, fontFamily:T.body, fontSize:12, color:"#1D4ED8", lineHeight:1.6 }}>
                      💾 <strong>Créez un compte gratuit</strong> pour sauvegarder ces résultats et accéder à l'historique de vos analyses.
                      <span onClick={() => { if (onShowAuth) onShowAuth(); }} style={{ display:"block", marginTop:6, cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>
                        S'inscrire gratuitement →
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (importSuccess) return;
                      if (!authUser) {
                        localStorage.setItem("freeley_pending_import", "1");
                        if (onShowAuth) onShowAuth();
                        return;
                      }
                      setImportSuccess(true);
                      setTimeout(() => {
                        if (onImportToDashboard) onImportToDashboard(extractedData);
                        onClose();
                      }, 1000);
                    }}
                    style={{
                      width:"100%", padding:"16px 20px",
                      background: importSuccess
                        ? "linear-gradient(135deg, #065F46 0%, #10B981 100%)"
                        : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                      color:"#FFFFFF", border:"none", borderRadius:12, cursor: importSuccess ? "default" : "pointer",
                      fontFamily:T.body, fontSize:15, fontWeight:800,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                      boxShadow: importSuccess ? "0 4px 20px #10B98150" : "0 6px 28px #7C3AED55",
                      transition:"all 0.3s",
                      letterSpacing:"0.01em",
                    }}
                    onMouseOver={e => { if (!importSuccess) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 36px #7C3AED65"; }}}
                    onMouseOut={e => { if (!importSuccess) { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 28px #7C3AED55"; }}}
                  >
                    {importSuccess ? (
                      <><span style={{ fontSize:18 }}>✅</span> Importé ! Ouverture du tableau de bord…</>
                    ) : (
                      <><span style={{ fontSize:18 }}>📥</span> Importer et générer mon tableau de bord Freeley</>
                    )}
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button onClick={onClose} style={{
                width:"100%", padding:"13px",
                background:C.navy, color:C.white,
                border:"none", borderRadius:8, cursor:"pointer",
                fontSize:14, fontFamily:T.body, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow:"0 4px 14px #1B2E4B28",
                transition:"all 0.18s",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background="#152438"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.navy; e.currentTarget.style.transform="translateY(0)"; }}
              >
                ← Fermer et revenir au tableau de bord
              </button>
            </>
          )}

        </div>
      </div>
    </div>
    </>
  );
}

/* ══════════════════════════════════════════ DEPOSIT INVOICE MODAL ══ */
function DepositInvoiceModal({ form, acomptePct, acompte, isComptant, onClose }) {
  const [downloaded, setDownloaded] = useState(false);

  const today = new Date();
  const todayStr = today.toLocaleDateString("fr-FR");
  const year = today.getFullYear();
  const invoiceNum = `FAC-${year}-${String(Date.now()).slice(-3).padStart(3,"0")}`;

  const priceHT = parseFloat(form.price) || 0;
  const depositHT = acompte;
  const tva = Math.round(depositHT * 0.2 * 100) / 100;
  const ttc = Math.round((depositHT + tva) * 100) / 100;
  const fmt = (n) => Number(n).toLocaleString("fr-FR", { minimumFractionDigits:2, maximumFractionDigits:2 });

  const freelanceName = form.freelanceName?.trim() || "—";
  const freelanceActivity = form.freelanceActivity?.trim() || "—";
  const freelanceSiret = form.freelanceSiret?.trim() || null;
  const freelanceAddress = form.freelanceAddress?.trim() || "—";
  const freelanceEmail = form.freelanceEmail?.trim() || "—";
  const clientName = form.clientName?.trim() || "—";
  const clientCompany = form.clientCompany?.trim() || null;
  const clientAddress = form.clientAddress?.trim() || "—";
  const clientEmail = form.clientEmail?.trim() || "—";
  const missionTitle = form.missionTitle?.trim() || "Prestation";
  const designation = isComptant
    ? `Paiement comptant (100%) — Mission « ${missionTitle} »`
    : `Acompte de ${acomptePct}% — Mission « ${missionTitle} »`;

  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toLocaleDateString("fr-FR");

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, background:"rgba(15,28,45,0.78)",
        zIndex:20000, display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:"20px 16px", overflowY:"auto", backdropFilter:"blur(6px)",
      }}
    >
      <div className="fade-up" style={{
        background:C.white, borderRadius:20, width:"100%", maxWidth:520,
        boxShadow:"0 40px 100px #00000045", overflow:"hidden",
        marginTop:16, marginBottom:16,
      }}>

        {/* ── Header ── */}
        <div style={{
          background:`linear-gradient(135deg, ${C.navy} 0%, #2A4167 100%)`,
          padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:40, height:40, background:"#FFFBEB", borderRadius:10,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}>🧾</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:17, color:C.white, fontWeight:700 }}>
                {isComptant ? "Facture — Paiement comptant" : "Facture d'acompte"}
              </div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#8BA3C0", marginTop:1 }}>
                {invoiceNum} · {todayStr}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:"50%", background:"#253D5E",
            border:"none", color:"#8BA3C0", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>✕</button>
        </div>

        {/* ── Corps facture ── */}
        <div style={{ padding:"24px 24px 0" }}>

          {/* Numéro + date */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"flex-start",
            marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.borderL}`,
          }}>
            <div>
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:700, marginBottom:3 }}>NUMÉRO DE FACTURE</div>
              <div style={{ fontFamily:T.display, fontSize:18, color:C.navy, fontWeight:700 }}>{invoiceNum}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:700, marginBottom:3 }}>DATE D'ÉMISSION</div>
              <div style={{ fontFamily:T.body, fontSize:13, color:C.navy, fontWeight:600 }}>{todayStr}</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginTop:2 }}>Échéance : {dueDateStr}</div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:16, marginBottom:20 }}>
            {/* Émetteur */}
            <div style={{
              background:C.creamD, borderRadius:10, padding:"14px 16px",
              border:`1px solid ${C.border}`,
            }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.14em", color:C.gold, fontWeight:800, marginBottom:10 }}>ÉMETTEUR (PRESTATAIRE)</div>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, marginBottom:3 }}>{freelanceName}</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:C.textM, marginBottom:2 }}>{freelanceActivity}</div>
              {freelanceSiret && (
                <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, marginBottom:2 }}>SIRET : {freelanceSiret}</div>
              )}
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, lineHeight:1.5, marginBottom:2 }}>{freelanceAddress}</div>
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>{freelanceEmail}</div>
            </div>
            {/* Destinataire */}
            <div style={{
              background:"#EFF6FF", borderRadius:10, padding:"14px 16px",
              border:"1px solid #BFDBFE",
            }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.14em", color:"#3B82F6", fontWeight:800, marginBottom:10 }}>DESTINATAIRE (CLIENT)</div>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, marginBottom:3 }}>{clientName}</div>
              {clientCompany && (
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textM, marginBottom:2 }}>{clientCompany}</div>
              )}
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL, lineHeight:1.5, marginBottom:2 }}>{clientAddress}</div>
              <div style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>{clientEmail}</div>
            </div>
          </div>

          {/* Ligne de prestation */}
          <div style={{ marginBottom:16 }}>
            <div style={{
              display:"grid", gridTemplateColumns:"1fr auto",
              background:C.navy, borderRadius:"8px 8px 0 0",
              padding:"8px 14px",
            }}>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.12em", color:"#8BA3C0", fontWeight:700 }}>DÉSIGNATION</div>
              <div style={{ fontFamily:T.body, fontSize:9, letterSpacing:"0.12em", color:"#8BA3C0", fontWeight:700, textAlign:"right" }}>MONTANT HT</div>
            </div>
            <div style={{
              display:"grid", gridTemplateColumns:"1fr auto",
              background:C.cream, border:`1px solid ${C.border}`, borderTop:"none",
              borderRadius:"0 0 8px 8px", padding:"14px",
              alignItems:"center",
            }}>
              <div>
                <div style={{ fontFamily:T.body, fontSize:12.5, fontWeight:600, color:C.navy, marginBottom:3 }}>{designation}</div>
                <div style={{ fontFamily:T.body, fontSize:10.5, color:C.textL }}>
                  Montant total de la mission : {fmt(priceHT)} € HT
                </div>
              </div>
              <div style={{ fontFamily:T.display, fontSize:17, color:C.navy, fontWeight:700, textAlign:"right", paddingLeft:16 }}>
                {fmt(depositHT)} €
              </div>
            </div>
          </div>

          {/* Totaux */}
          <div style={{ background:C.creamD, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
            {[
              ["Sous-total HT", `${fmt(depositHT)} €`],
              ["TVA 20 %",      `${fmt(tva)} €`],
            ].map(([label, val]) => (
              <div key={label} style={{
                display:"flex", justifyContent:"space-between",
                fontFamily:T.body, fontSize:12, color:C.textM, marginBottom:7,
              }}>
                <span>{label}</span>
                <span style={{ fontWeight:500, color:C.navy }}>{val}</span>
              </div>
            ))}
            <div style={{ height:1, background:C.border, margin:"10px 0" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy }}>TOTAL TTC</span>
              <span style={{ fontFamily:T.display, fontSize:24, fontWeight:700, color:C.navy }}>{fmt(ttc)} €</span>
            </div>
          </div>

          {/* Conditions de règlement */}
          <div style={{
            background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8,
            padding:"10px 14px", marginBottom:14,
            fontFamily:T.body, fontSize:11, color:"#15803D", lineHeight:1.6,
          }}>
            ✓ {isComptant ? "Paiement intégral à la commande" : "Acompte à régler à la commande"} · Paiement par virement bancaire
          </div>

          {/* Mentions informatives */}
          <div style={{
            borderTop:`1px solid ${C.borderL}`, paddingTop:12, marginBottom:4,
            fontFamily:T.body, fontSize:9.5, color:C.textL, lineHeight:1.65,
          }}>
            <div style={{ marginBottom:4 }}>
              {freelanceSiret
                ? `Micro-entreprise immatriculée sous le SIRET ${freelanceSiret}. TVA non applicable, art. 293B du CGI.`
                : "TVA non applicable, art. 293B du CGI."
              }
            </div>
            <div>Pénalités de retard : taux BCE + 10 points. Indemnité forfaitaire de recouvrement : 40 €. Tout retard de paiement entraîne l'exigibilité immédiate des sommes dues (art. L441-10 C.com.).</div>
          </div>
        </div>

        {/* ── Boutons footer ── */}
        <div style={{ padding:"16px 24px 20px", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"12px",
            background:C.creamD, border:`1px solid ${C.border}`,
            borderRadius:9, cursor:"pointer",
            fontFamily:T.body, fontSize:13, color:C.textM, fontWeight:500,
          }}>Fermer</button>

          <button
            onClick={handleDownload}
            style={{
              flex:2, padding:"12px",
              background: downloaded
                ? "linear-gradient(135deg,#15803D 0%,#22C55E 100%)"
                : `linear-gradient(135deg,${C.gold} 0%,${C.goldL} 100%)`,
              border:"none", borderRadius:9, cursor:"pointer",
              fontFamily:T.body, fontSize:13, fontWeight:700,
              color: downloaded ? C.white : C.navyD,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: downloaded ? "0 4px 14px #15803D30" : "0 4px 14px #B8965A30",
              transition:"all 0.25s",
            }}
            onMouseOver={e=>{ if(!downloaded){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 22px #B8965A45"; }}}
            onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=downloaded?"0 4px 14px #15803D30":"0 4px 14px #B8965A30"; }}
          >
            {downloaded
              ? <><span>✓</span> Facture téléchargée !</>
              : <><span>⬇</span> Télécharger le PDF</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ TACTILE SIGNATURE MODAL ══ */
function TactileSignatureModal({ form, onClose, onGoToProfile, depositPct: depositPctProp }) {
  // step: 0 = freelance signs, 1 = client simulation, 2 = sealed
  const [step, setStep] = useState(0);
  const [freelanceSigned, setFreelanceSigned] = useState(false);
  const [clientSigned, setClientSigned] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Canvas refs
  const freelanceCanvasRef = useRef(null);
  const clientCanvasRef = useRef(null);
  const [freelanceDrawing, setFreelanceDrawing] = useState(false);
  const [clientDrawing, setClientDrawing] = useState(false);
  const [freelanceHasStrokes, setFreelanceHasStrokes] = useState(false);
  const [clientHasStrokes, setClientHasStrokes] = useState(false);

  const acomptePct = depositPctProp ?? 30;
  const isComptant = acomptePct === 100;
  const acompte = form.price ? Math.round(Number(form.price) * (acomptePct / 100)) : 0;
  const clientName = form.clientName || "Jean Dupont";
  const [showDepositInvoiceModal, setShowDepositInvoiceModal] = useState(false);

  // Drawing helpers
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (ref, setDrawing, setHasStrokes) => (e) => {
    e.preventDefault();
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1B2E4B";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasStrokes(true);
  };

  const draw = (ref, isDrawing) => (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (setDrawing) => (e) => {
    e?.preventDefault();
    setDrawing(false);
  };

  const clearCanvas = (ref, setHasStrokes) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const handleValidateFreelance = () => {
    if (!freelanceHasStrokes) return;
    setFreelanceSigned(true);
    setStep(1);
  };

  const handleSimulateClient = () => {
    if (!clientHasStrokes) return;
    setIsSimulating(true);
    setTimeout(() => {
      setClientSigned(true);
      setIsSimulating(false);
      setStep(2);
    }, 1400);
  };

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.65)",
      backdropFilter:"blur(4px)",
      zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
      overflowY:"auto",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fade-up" style={{
        background:C.white,
        borderRadius:20,
        width:"100%", maxWidth:520,
        boxShadow:"0 32px 80px rgba(0,0,0,0.35)",
        overflow:"hidden",
        position:"relative",
        margin:"auto",
      }}>

        {/* ── Header ── */}
        <div style={{
          background:"linear-gradient(135deg, #1B2E4B 0%, #2A3F6A 100%)",
          padding:"24px 28px 20px",
          position:"relative",
        }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16,
            width:32, height:32, borderRadius:"50%",
            background:"rgba(255,255,255,0.12)", border:"none",
            color:C.white, fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.18s",
          }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.22)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          >✕</button>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:"rgba(255,255,255,0.12)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            }}>🔐</div>
            <div>
              <div style={{ fontFamily:T.display, fontSize:19, color:C.white, fontWeight:600 }}>Signature électronique sécurisée</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:"#8BA3C0", marginTop:2 }}>
                {form.missionTitle} · {Number(form.price||0).toLocaleString("fr-FR")} € HT
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div style={{ display:"flex", gap:10 }}>
            {/* Prestataire */}
            <div style={{
              flex:1, background:"rgba(255,255,255,0.08)",
              borderRadius:12, padding:"12px 14px",
              border: freelanceSigned
                ? "1.5px solid #22C55E"
                : "1.5px solid rgba(255,255,255,0.12)",
              transition:"all 0.4s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{freelanceSigned ? "🟢" : "🟡"}</span>
                <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  color: freelanceSigned ? "#22C55E" : "#FCD34D" }}>
                  {freelanceSigned ? "SIGNÉ" : "EN ATTENTE"}
                </span>
              </div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.white, fontWeight:600 }}>Prestataire (Vous)</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#6A8AB0", marginTop:2 }}>{form.freelanceName || "Vous"}</div>
            </div>

            {/* Arrow */}
            <div style={{ display:"flex", alignItems:"center", color:"#354F6E", fontSize:18 }}>→</div>

            {/* Client */}
            <div style={{
              flex:1, background:"rgba(255,255,255,0.08)",
              borderRadius:12, padding:"12px 14px",
              border: clientSigned
                ? "1.5px solid #22C55E"
                : freelanceSigned
                  ? "1.5px solid #3B82F6"
                  : "1.5px solid rgba(255,255,255,0.08)",
              transition:"all 0.4s",
              opacity: freelanceSigned ? 1 : 0.5,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{clientSigned ? "🟢" : freelanceSigned ? "🔵" : "⏳"}</span>
                <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  color: clientSigned ? "#22C55E" : freelanceSigned ? "#60A5FA" : "#6A8AB0" }}>
                  {clientSigned ? "SIGNÉ" : freelanceSigned ? "PRÊT" : "BLOQUÉ"}
                </span>
              </div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.white, fontWeight:600 }}>Client</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:"#6A8AB0", marginTop:2 }}>{clientName}</div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"24px 28px 28px" }}>

          {/* ────────── ÉTAPE 0 : Freelance signe ────────── */}
          {step === 0 && (
            <div style={{ animation:"fadeUp 0.35s ease both" }}>
              <div style={{
                fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy,
                marginBottom:14, display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{
                  width:24, height:24, borderRadius:"50%",
                  background:C.navy, color:C.white,
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, flexShrink:0,
                }}>1</span>
                Apposez votre signature
              </div>

              {/* Canvas zone */}
              <div style={{
                background:"#F8F7F4",
                border:`2px dashed ${freelanceHasStrokes ? "#1B2E4B" : C.border}`,
                borderRadius:14, overflow:"hidden",
                transition:"border-color 0.25s",
                position:"relative",
              }}>
                <canvas
                  ref={freelanceCanvasRef}
                  width={460} height={160}
                  style={{ width:"100%", height:160, display:"block", touchAction:"none", cursor:"crosshair" }}
                  onMouseDown={startDraw(freelanceCanvasRef, setFreelanceDrawing, setFreelanceHasStrokes)}
                  onMouseMove={draw(freelanceCanvasRef, freelanceDrawing)}
                  onMouseUp={stopDraw(setFreelanceDrawing)}
                  onMouseLeave={stopDraw(setFreelanceDrawing)}
                  onTouchStart={startDraw(freelanceCanvasRef, setFreelanceDrawing, setFreelanceHasStrokes)}
                  onTouchMove={draw(freelanceCanvasRef, freelanceDrawing)}
                  onTouchEnd={stopDraw(setFreelanceDrawing)}
                />
                {!freelanceHasStrokes && (
                  <div style={{
                    position:"absolute", inset:0,
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    pointerEvents:"none",
                  }}>
                    <div style={{ fontSize:28, marginBottom:8, opacity:0.25 }}>✍️</div>
                    <div style={{ fontFamily:T.body, fontSize:12, color:C.textL, textAlign:"center", lineHeight:1.5 }}>
                      Signez avec votre doigt<br/>directement sur l'écran
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button
                  onClick={() => clearCanvas(freelanceCanvasRef, setFreelanceHasStrokes)}
                  style={{
                    flex:1, padding:"11px",
                    background:C.creamD, border:`1.5px solid ${C.border}`,
                    borderRadius:9, cursor:"pointer",
                    fontFamily:T.body, fontSize:13, color:C.textM, fontWeight:500,
                    transition:"all 0.18s",
                  }}
                  onMouseOver={e=>e.currentTarget.style.background=C.creamDD}
                  onMouseOut={e=>e.currentTarget.style.background=C.creamD}
                >🗑 Effacer</button>
                <button
                  onClick={handleValidateFreelance}
                  disabled={!freelanceHasStrokes}
                  style={{
                    flex:2, padding:"11px",
                    background: freelanceHasStrokes
                      ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                      : C.creamDD,
                    border:"none", borderRadius:9,
                    cursor: freelanceHasStrokes ? "pointer" : "not-allowed",
                    fontFamily:T.body, fontSize:13, fontWeight:700,
                    color: freelanceHasStrokes ? C.white : C.textL,
                    transition:"all 0.2s",
                    boxShadow: freelanceHasStrokes ? "0 4px 14px #6366F140" : "none",
                  }}
                  onMouseOver={e=>{ if (freelanceHasStrokes) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 20px #6366F160"; }}}
                  onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow= freelanceHasStrokes ? "0 4px 14px #6366F140" : "none"; }}
                >✅ Valider ma signature</button>
              </div>
            </div>
          )}

          {/* ────────── ÉTAPE 1 : Simulation côté client ────────── */}
          {step === 1 && (
            <div style={{ animation:"fadeUp 0.35s ease both" }}>
              {/* Success banner freelance */}
              <div style={{
                background:"#F0FDF4", border:"1.5px solid #86EFAC",
                borderRadius:10, padding:"12px 16px", marginBottom:18,
                display:"flex", alignItems:"center", gap:10,
              }}>
                <span style={{ fontSize:20 }}>✅</span>
                <div>
                  <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:"#15803D" }}>Votre signature a bien été enregistrée !</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:"#166534", marginTop:1 }}>
                    Un lien unique a été envoyé à <strong>{clientName}</strong>. Voici son écran :
                  </div>
                </div>
              </div>

              {/* Client simulation frame */}
              <div style={{
                background:"linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
                border:"1.5px solid #BFDBFE",
                borderRadius:14, padding:"18px 18px 16px",
                position:"relative", overflow:"hidden",
              }}>
                {/* "Écran client" badge */}
                <div style={{
                  position:"absolute", top:12, right:12,
                  background:"#3B82F6", color:C.white,
                  fontFamily:T.body, fontSize:9, fontWeight:700, letterSpacing:"0.1em",
                  padding:"3px 10px", borderRadius:20,
                }}>APERÇU CLIENT</div>

                <div style={{
                  fontFamily:T.body, fontSize:12, color:"#1D4ED8", fontWeight:600, marginBottom:12,
                }}>
                  👋 Bonjour {clientName}, voici votre contrat à signer
                </div>

                {/* ── Bannière confiance client ── */}
                {(() => {
                  const clientEmail = form.clientEmail || "";
                  const rating = clientEmail ? getClientRating(clientEmail) : null;
                  if (rating && rating.avg >= 4) {
                    return (
                      <div style={{
                        background:"linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
                        border:"1.5px solid #6EE7B7",
                        borderRadius:10, padding:"10px 13px", marginBottom:12,
                        display:"flex", alignItems:"center", gap:8,
                        animation:"fadeUp 0.3s ease both",
                      }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>🛡️</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:T.body, fontSize:11, fontWeight:700, color:"#065F46", marginBottom:1 }}>
                            Vos prestataires vous adorent ! Vous avez une note de ⭐ {rating.avg}/5.
                          </div>
                          <div style={{ fontFamily:T.body, fontSize:10, color:"#047857", lineHeight:1.5 }}>
                            Créez un compte gratuit pour suivre tous vos contrats scellés.
                          </div>
                        </div>
                      </div>
                    );
                  }
                  // Bannière neutre pour les nouveaux clients sans historique
                  return (
                    <div style={{
                      background:"linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
                      border:"1.5px solid #C7D2FE",
                      borderRadius:10, padding:"10px 13px", marginBottom:12,
                      display:"flex", alignItems:"center", gap:8,
                    }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>🛡️</span>
                      <div style={{ fontFamily:T.body, fontSize:10, color:"#4338CA", lineHeight:1.55, fontWeight:500 }}>
                        Contrat sécurisé et horodaté par Freeley. Créez un compte pour suivre toutes vos missions.
                      </div>
                    </div>
                  );
                })()}

                {/* Recap card */}
                <div style={{
                  background:C.white, borderRadius:10, padding:"12px 14px", marginBottom:14,
                  border:"1px solid #DBEAFE",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>Mission</span>
                    <span style={{ fontFamily:T.body, fontSize:11, fontWeight:600, color:C.navy }}>{form.missionTitle || "Mission freelance"}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>Montant</span>
                    <span style={{ fontFamily:T.body, fontSize:11, fontWeight:600, color:C.navy }}>{Number(form.price||0).toLocaleString("fr-FR")} € HT</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>
                      {isComptant ? "Paiement comptant à régler" : "Acompte à régler"}
                    </span>
                    <span style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:"#7C3AED" }}>
                      {acompte.toLocaleString("fr-FR")} € ({acomptePct}%)
                    </span>
                  </div>
                </div>

                {/* Client canvas */}
                <div style={{
                  fontFamily:T.body, fontSize:12, color:"#374151", fontWeight:600, marginBottom:8,
                }}>Signez ici pour valider :</div>
                <div style={{
                  background:C.white,
                  border:`2px dashed ${clientHasStrokes ? "#3B82F6" : "#BFDBFE"}`,
                  borderRadius:12, overflow:"hidden",
                  transition:"border-color 0.25s",
                  position:"relative",
                }}>
                  <canvas
                    ref={clientCanvasRef}
                    width={460} height={130}
                    style={{ width:"100%", height:130, display:"block", touchAction:"none", cursor:"crosshair" }}
                    onMouseDown={startDraw(clientCanvasRef, setClientDrawing, setClientHasStrokes)}
                    onMouseMove={draw(clientCanvasRef, clientDrawing)}
                    onMouseUp={stopDraw(setClientDrawing)}
                    onMouseLeave={stopDraw(setClientDrawing)}
                    onTouchStart={startDraw(clientCanvasRef, setClientDrawing, setClientHasStrokes)}
                    onTouchMove={draw(clientCanvasRef, clientDrawing)}
                    onTouchEnd={stopDraw(setClientDrawing)}
                  />
                  {!clientHasStrokes && (
                    <div style={{
                      position:"absolute", inset:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      pointerEvents:"none",
                    }}>
                      <div style={{ fontFamily:T.body, fontSize:12, color:"#93C5FD", textAlign:"center" }}>
                        ✍️ Zone de signature du client
                      </div>
                    </div>
                  )}
                </div>

                {/* Client action buttons */}
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <button
                    onClick={() => clearCanvas(clientCanvasRef, setClientHasStrokes)}
                    style={{
                      flex:1, padding:"10px",
                      background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                      borderRadius:8, cursor:"pointer",
                      fontFamily:T.body, fontSize:12, color:"#1D4ED8", fontWeight:500,
                    }}
                  >🗑 Effacer</button>
                  <button
                    onClick={handleSimulateClient}
                    disabled={!clientHasStrokes || isSimulating}
                    style={{
                      flex:2, padding:"10px",
                      background: clientHasStrokes && !isSimulating
                        ? "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)"
                        : "#DBEAFE",
                      border:"none", borderRadius:8,
                      cursor: clientHasStrokes && !isSimulating ? "pointer" : "not-allowed",
                      fontFamily:T.body, fontSize:12, fontWeight:700,
                      color: clientHasStrokes && !isSimulating ? C.white : "#93C5FD",
                      transition:"all 0.2s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    }}
                  >
                    {isSimulating ? (
                      <><span style={{ width:12, height:12, border:"2px solid #93C5FD", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Validation…</>
                    ) : "🖊 Simuler la signature du client"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────── ÉTAPE 2 : Contrat 100% scellé ────────── */}
          {step === 2 && (
            <div style={{ animation:"fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both", textAlign:"center" }}>
              {/* Big success badge */}
              <div style={{
                background:"linear-gradient(135deg, #052E16 0%, #14532D 100%)",
                borderRadius:16, padding:"20px 16px", marginBottom:20,
                position:"relative", overflow:"hidden",
              }}>
                {/* Decorative circles */}
                <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(34,197,94,0.12)" }} />
                <div style={{ position:"absolute", bottom:-30, left:-10, width:80, height:80, borderRadius:"50%", background:"rgba(34,197,94,0.08)" }} />

                <div style={{ fontSize:48, marginBottom:12, animation:"fadeUp 0.4s ease 0.1s both" }}>🔒</div>
                <div style={{
                  fontFamily:T.display, fontSize:22, color:"#4ADE80", fontWeight:700, marginBottom:6,
                  animation:"fadeUp 0.4s ease 0.2s both",
                }}>Contrat 100% Scellé & Sécurisé</div>
                <div style={{
                  fontFamily:T.body, fontSize:13, color:"#86EFAC", lineHeight:1.65,
                  animation:"fadeUp 0.4s ease 0.3s both",
                }}>
                  Contrat signé par les deux parties.<br/>
                  {isComptant
                    ? <>Il reste à régler <strong style={{ color:"#4ADE80" }}>la totalité (100%)</strong> par virement bancaire (IBAN sur la facture).</>
                    : <>Il reste à régler l'acompte de <strong style={{ color:"#4ADE80" }}>{acomptePct}%</strong> par virement bancaire (IBAN sur la facture).</>
                  }
                </div>
              </div>

              {/* Acompte card */}
              <div style={{
                background:"#F0FDF4", border:"1.5px solid #86EFAC",
                borderRadius:12, padding:"16px 20px", marginBottom:20,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontFamily:T.body, fontSize:11, color:"#166534", letterSpacing:"0.1em", fontWeight:700, marginBottom:4 }}>
                    {isComptant ? "PAIEMENT COMPTANT À RÉGLER PAR LE CLIENT" : "ACOMPTE À RÉGLER PAR LE CLIENT"}
                  </div>
                  <div style={{ fontFamily:T.display, fontSize:28, color:"#15803D", fontWeight:700 }}>{acompte.toLocaleString("fr-FR")} €</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:"#166534" }}>
                    {isComptant
                      ? `100% du total · ${Number(form.price||0).toLocaleString("fr-FR")} € HT`
                      : `${acomptePct}% du total · ${Number(form.price||0).toLocaleString("fr-FR")} € HT`
                    }
                  </div>
                </div>
                <div style={{ textAlign:"center", maxWidth:120 }}>
                  <div style={{
                    width:48, height:48, borderRadius:10, margin:"0 auto",
                    background:"#DCFCE7", border:"1.5px solid #86EFAC",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                  }}>🏦</div>
                  <div style={{ fontFamily:T.body, fontSize:9, color:"#166534", marginTop:4, fontWeight:600, lineHeight:1.4 }}>Par virement — IBAN sur la facture</div>
                </div>
              </div>

              {/* ── Bouton Facture d'acompte ── */}
              <button
                onClick={() => setShowDepositInvoiceModal(true)}
                style={{
                  width:"100%", marginBottom:14,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"11px 16px",
                  background:"linear-gradient(135deg, #FFFBEB 0%, #FEF9EE 100%)",
                  border:"1.5px solid #FCD34D",
                  borderRadius:10, cursor:"pointer",
                  fontFamily:T.body, fontSize:13, fontWeight:700,
                  color:"#92400E",
                  boxShadow:"0 2px 8px #F59E0B18",
                  transition:"all .18s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7 0%,#FEF9EE 100%)"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 5px 16px #F59E0B25"; }}
                onMouseOut={e=>{ e.currentTarget.style.background="linear-gradient(135deg,#FFFBEB 0%,#FEF9EE 100%)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px #F59E0B18"; }}
              >
                <span style={{ fontSize:15 }}>📄</span>
                Télécharger la facture d'acompte (PDF)
              </button>

              {/* Payment methods */}
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                {["Apple Pay", "💳 Carte bancaire", "🏦 Virement"].map(m => (
                  <div key={m} style={{
                    flex:1, background:C.creamD, borderRadius:8, padding:"8px 6px",
                    fontFamily:T.body, fontSize:10, fontWeight:600, color:C.textM,
                    textAlign:"center", border:`1px solid ${C.border}`,
                  }}>{m}</div>
                ))}
              </div>

              {/* Confirm message */}
              <div style={{
                background:"#F0FDF4", border:"1px solid #86EFAC",
                borderRadius:10, padding:"12px 16px", marginBottom:20,
                fontFamily:T.body, fontSize:12, color:"#166534", lineHeight:1.6,
                textAlign:"left",
              }}>
                🚀 <strong>Les travaux peuvent démarrer !</strong> Vous recevrez une confirmation par email dès que {isComptant ? "le paiement comptant sera encaissé" : "l'acompte sera encaissé"}.
              </div>

              {/* ── Conseil Pro Freeley ── */}
              <div style={{
                background:"linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                border:"1.5px solid #FCD34D",
                borderRadius:14, padding:"18px 18px 16px",
                marginBottom:14, position:"relative", overflow:"hidden",
              }}>
                {/* Decorative dot */}
                <div style={{ position:"absolute", top:-16, right:-16, width:64, height:64, borderRadius:"50%", background:"rgba(251,191,36,0.15)", pointerEvents:"none" }} />
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>🎯</span>
                  <div>
                    <div style={{ fontFamily:T.body, fontSize:11, fontWeight:800, color:"#92400E", letterSpacing:"0.12em", marginBottom:5 }}>CONSEIL PRO FREELEY</div>
                    <div style={{ fontFamily:T.body, fontSize:12.5, color:"#78350F", lineHeight:1.65 }}>
                      Gagnez du temps pour vos prochains contrats ! Sauvegardez votre nom, votre métier et vos liens pros. Avoir un profil complété renforce votre crédibilité et rassure vos futurs clients.
                    </div>
                  </div>
                </div>
                <button
                  onClick={onGoToProfile}
                  style={{
                    width:"100%", padding:"11px",
                    background:"linear-gradient(135deg, #92400E 0%, #B45309 100%)",
                    color:"#FEF3C7", border:"none", borderRadius:9, cursor:"pointer",
                    fontSize:13, fontFamily:T.body, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    transition:"all 0.2s",
                    boxShadow:"0 4px 14px rgba(146,64,14,0.25)",
                    letterSpacing:"0.02em",
                  }}
                  onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 7px 20px rgba(146,64,14,0.35)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(146,64,14,0.25)"; }}
                >
                  💾 Créer mon profil <span style={{ fontWeight:400, opacity:0.75, fontSize:11 }}>(Optionnel)</span>
                </button>
              </div>

              <button onClick={onClose} style={{
                width:"100%", padding:"13px",
                background:C.navy, color:C.white,
                border:"none", borderRadius:10, cursor:"pointer",
                fontSize:14, fontFamily:T.body, fontWeight:700,
                boxShadow:"0 4px 14px #1B2E4B28",
                transition:"all 0.2s",
              }}
                onMouseOver={e=>{ e.currentTarget.style.background="#152438"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.background=C.navy; e.currentTarget.style.transform="translateY(0)"; }}
              >✓ Fermer — Revenir au contrat</button>
            </div>
          )}

        </div>
      </div>

      {/* ── Facture d'acompte Modal ── */}
      {showDepositInvoiceModal && (
        <DepositInvoiceModal
          form={form}
          acomptePct={acomptePct}
          acompte={acompte}
          isComptant={isComptant}
          onClose={() => setShowDepositInvoiceModal(false)}
        />
      )}
    </div>
  );
}
function SubscriptionModal({ onClose, onSubscribe }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(10,20,40,0.72)", zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      backdropFilter:"blur(6px)",
      animation:"fadeUp 0.3s ease both",
    }}>
      <div style={{
        maxWidth:440, width:"100%", background:C.white, borderRadius:24,
        padding:"40px 36px 32px", boxShadow:"0 32px 80px #1B2E4B30",
        position:"relative", overflow:"hidden",
      }}>
        {/* Decorative blob */}
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"linear-gradient(135deg, #B8965A18 0%, #1B2E4B10 100%)", pointerEvents:"none" }} />

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28, position:"relative" }}>
          <div style={{
            width:64, height:64, borderRadius:"50%",
            background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px", fontSize:26,
            boxShadow:"0 8px 24px #1B2E4B30",
          }}>💎</div>
          <h2 style={{ fontFamily:T.display, fontSize:24, color:C.navy, fontWeight:700, marginBottom:8, lineHeight:1.2 }}>
            Devenez membre Freeley
          </h2>
          <p style={{ fontFamily:T.body, fontSize:14, color:C.textM, lineHeight:1.65, maxWidth:320, margin:"0 auto" }}>
            Vos <strong style={{color:C.navy}}>2 essais gratuits</strong> ont été utilisés.<br/>
            Continuez à générer des contrats pro en illimité.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {/* Plan star */}
          <div
            onClick={() => onSubscribe("mensuel")}
            onMouseOver={() => setHovered("mensuel")}
            onMouseOut={() => setHovered(null)}
            style={{
              background: hovered==="mensuel" ? C.navy : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
              border:`2px solid ${C.navy}`,
              borderRadius:14, padding:"16px 20px", cursor:"pointer",
              transition:"all 0.2s", boxShadow: hovered==="mensuel" ? "0 10px 30px #1B2E4B40" : "0 4px 16px #1B2E4B20",
              transform: hovered==="mensuel" ? "translateY(-2px)" : "none",
              position:"relative", overflow:"hidden",
            }}
          >
            <div style={{ position:"absolute", top:8, right:12, background:C.gold, color:C.navyD, fontFamily:T.body, fontSize:9, fontWeight:800, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:20 }}>⭐ RECOMMANDÉ</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:T.body, fontSize:15, fontWeight:700, color:C.white, marginBottom:2 }}>Abonnement mensuel</div>
                <div style={{ fontFamily:T.body, fontSize:12, color:"#8BA3C0" }}>Contrats illimités · Annulez quand vous voulez</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:T.display, fontSize:24, fontWeight:700, color:C.goldL }}>17€</div>
                <div style={{ fontFamily:T.body, fontSize:11, color:C.gold }}>/mois</div>
              </div>
            </div>
          </div>

          {/* Plan unité */}
          <div
            onClick={() => onSubscribe("unite")}
            onMouseOver={() => setHovered("unite")}
            onMouseOut={() => setHovered(null)}
            style={{
              background: hovered==="unite" ? C.creamD : C.white,
              border:`1.5px solid ${hovered==="unite" ? C.navy : C.border}`,
              borderRadius:14, padding:"14px 20px", cursor:"pointer",
              transition:"all 0.2s",
              transform: hovered==="unite" ? "translateY(-1px)" : "none",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:T.body, fontSize:14, fontWeight:600, color:C.navy, marginBottom:2 }}>📦 À l'unité</div>
                <div style={{ fontFamily:T.body, fontSize:12, color:C.textL }}>Un seul contrat, sans engagement</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:T.display, fontSize:20, fontWeight:600, color:C.navy }}>4€</div>
                <div style={{ fontFamily:T.body, fontSize:10, color:C.textL }}>par contrat</div>
              </div>
            </div>
          </div>

          {/* Plan annuel */}
          <div
            onClick={() => onSubscribe("annuel")}
            onMouseOver={() => setHovered("annuel")}
            onMouseOut={() => setHovered(null)}
            style={{
              background: hovered==="annuel" ? "#F5F3FF" : "#FAF9FF",
              border:`1.5px solid ${hovered==="annuel" ? "#7C4DFF" : "#E8E4FF"}`,
              borderRadius:14, padding:"14px 20px", cursor:"pointer",
              transition:"all 0.2s",
              transform: hovered==="annuel" ? "translateY(-1px)" : "none",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:T.body, fontSize:14, fontWeight:600, color:"#5B21B6", marginBottom:2 }}>☀️ Abonnement annuel</div>
                <div style={{ fontFamily:T.body, fontSize:12, color:"#7C4DFF" }}>Illimité · <strong>~12,40€/mois</strong></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:T.display, fontSize:20, fontWeight:600, color:"#5B21B6" }}>149€</div>
                <div style={{ fontFamily:T.body, fontSize:10, color:"#7C4DFF" }}>/an</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ background:C.creamD, borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
          {["✅ Contrats IA illimités", "✅ Téléchargement PDF inclus", "✅ Historique des contrats", "✅ Support prioritaire"].map(f => (
            <div key={f} style={{ fontFamily:T.body, fontSize:12, color:C.navy, lineHeight:2 }}>{f}</div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{ display:"block", margin:"0 auto", background:"none", border:"none", color:C.textL, fontSize:12, cursor:"pointer", fontFamily:T.body, textDecoration:"underline" }}
        >
          Pas maintenant — revenir en arrière
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ PROFILE GATE ══ */
function ProfileGate({ onCreateAccount, onBack }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"60px 20px 40px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 120px)" }}>
      <div className="fade-up" style={{
        width:"100%", background:C.white,
        border:`1px solid ${C.border}`, borderRadius:24,
        padding:"48px 40px", boxShadow:"0 24px 64px #1B2E4B10",
        textAlign:"center", position:"relative", overflow:"hidden",
      }}>
        {/* Decorative */}
        <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:`linear-gradient(135deg, ${C.navy}08 0%, ${C.gold}10 100%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-20, width:100, height:100, borderRadius:"50%", background:`${C.navy}05`, pointerEvents:"none" }} />

        {/* Lock icon */}
        <div style={{
          width:72, height:72, borderRadius:"50%",
          background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px", fontSize:30,
          boxShadow:"0 12px 32px #1B2E4B28",
        }}>🔒</div>

        <h2 style={{ fontFamily:T.display, fontSize:26, color:C.navy, fontWeight:700, marginBottom:12, lineHeight:1.2 }}>
          Option réservée aux membres
        </h2>
        <p style={{ fontFamily:T.body, fontSize:14, color:C.textM, lineHeight:1.75, marginBottom:32, maxWidth:380, margin:"0 auto 32px" }}>
          Créez un compte gratuit ou abonnez-vous pour <strong style={{color:C.navy}}>sauvegarder vos informations</strong> et débloquer votre vitrine pro accessible à vos clients.
        </p>

        {/* Benefits */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10, marginBottom:32, textAlign:"left" }}>
          {[
            { icon:"💾", title:"Profil sauvegardé", desc:"Vos infos pré-remplissent vos contrats" },
            { icon:"🌐", title:"Vitrine pro", desc:"Une page publique à partager" },
            { icon:"🔗", title:"Liens & réseaux", desc:"Portfolio, LinkedIn, GitHub" },
            { icon:"⭐", title:"Badge vérifié", desc:"Renforcez votre crédibilité" },
          ].map(b => (
            <div key={b.title} style={{ background:C.creamD, borderRadius:12, padding:"14px 14px" }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{b.icon}</div>
              <div style={{ fontFamily:T.body, fontSize:12, fontWeight:700, color:C.navy, marginBottom:3 }}>{b.title}</div>
              <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, lineHeight:1.5 }}>{b.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCreateAccount}
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          style={{
            width:"100%", padding:"16px",
            background: hovered ? C.navyD : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
            color:C.white, border:"none", borderRadius:14, cursor:"pointer",
            fontFamily:T.body, fontSize:15, fontWeight:700,
            boxShadow: hovered ? "0 12px 36px #1B2E4B50" : "0 6px 24px #1B2E4B30",
            transition:"all 0.2s",
            transform: hovered ? "translateY(-2px)" : "none",
            marginBottom:12,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}
        >
          <span style={{ fontSize:18 }}>🚀</span>
          Créer un compte gratuit
        </button>
        <button
          onClick={onBack}
          style={{ background:"none", border:"none", color:C.textL, fontSize:12, cursor:"pointer", fontFamily:T.body, textDecoration:"underline" }}
        >
          ← Revenir à l'accueil
        </button>
      </div>
    </div>
  );
}

function MiniPlanCard({ icon, title, price, sub, color, recommended, onSelect }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: recommended ? C.navy : C.white,
      border: recommended ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
      borderRadius:10, padding:"14px 18px", cursor:"pointer",
      boxShadow: recommended ? "0 4px 20px #1B2E4B20" : "none",
      transition:"all .18s",
    }} onClick={onSelect}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <div>
          <div style={{ fontFamily:T.body, fontSize:14, fontWeight:600, color: recommended ? C.white : C.navy }}>{title}</div>
          <div style={{ fontFamily:T.body, fontSize:11, color: recommended ? "#8BA3C0" : C.textL }}>{sub}</div>
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontFamily:T.display, fontSize:18, fontWeight:600, color: recommended ? C.goldL : C.navy }}>{price}</div>
        <div style={{ fontFamily:T.body, fontSize:10, color: recommended ? C.gold : color, fontWeight:600 }}>Choisir →</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ PROFILE PAGE ══ */
function ProfilePage({ profile, updateProfile, setProfile, onBack, authUser, premiumPlan, isPremium, onSignOut, onGoHome }) {
  const [newSkill, setNewSkill] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile("logo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || profile.skills.includes(s)) return;
    updateProfile("skills", [...profile.skills, s]);
    setNewSkill("");
  };

  const removeSkill = (skill) => {
    updateProfile("skills", profile.skills.filter(s => s !== skill));
  };

  const handleSave = () => {
    try { localStorage.setItem("freeley_profile", JSON.stringify(profile)); } catch(e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteAccount = async () => {
    setDeleteConfirming(true);
    await new Promise(r => setTimeout(r, 1800));
    if (onSignOut) await onSignOut();
    if (onGoHome) onGoHome();
  };

  const sections = [
    { id:"identity", label:"Identité", icon:"👤" },
    { id:"metier", label:"Métier", icon:"💼" },
    { id:"facturation", label:"Facturation", icon:"🧾" },
    { id:"liens", label:"Liens", icon:"🔗" },
  ];

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Mon Profil";
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const inputStyle = {
    width:"100%", padding:"12px 14px",
    border:`1.5px solid ${C.border}`, borderRadius:10,
    fontSize:14, fontFamily:T.body, color:C.text, outline:"none",
    background:C.white, boxSizing:"border-box", transition:"border-color 0.15s",
  };
  const labelStyle = {
    display:"block", fontFamily:T.body, fontSize:10,
    letterSpacing:"0.13em", color:C.textL, fontWeight:600, marginBottom:6,
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 120px" }}>

      {/* Hero card */}
      <div className="fade-up" style={{
        background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
        borderRadius:20, padding:"24px 16px", marginBottom:28,
        position:"relative", overflow:"hidden",
        boxShadow:"0 16px 48px #1B2E4B28",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:"rgba(184,150,90,0.15)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />

        <div style={{ display:"flex", alignItems:"center", gap:20, position:"relative" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width:80, height:80, borderRadius:"50%",
                background: profile.photo ? "transparent" : `linear-gradient(135deg, ${C.gold} 0%, ${C.goldL} 100%)`,
                border:"3px solid rgba(255,255,255,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", overflow:"hidden",
                boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
                transition:"transform 0.2s",
              }}
              onMouseOver={e=>e.currentTarget.style.transform="scale(1.05)"}
              onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
            >
              {profile.photo
                ? <img src={profile.photo} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span style={{ fontSize:28, fontFamily:T.display, fontWeight:700, color:C.navyD }}>{initials}</span>}
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position:"absolute", bottom:2, right:2,
                width:24, height:24, borderRadius:"50%",
                background:C.white, border:`2px solid ${C.navy}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", fontSize:11,
                boxShadow:"0 2px 8px rgba(0,0,0,0.2)",
              }}
            >📷</div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoUpload} />
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontFamily:T.display, fontSize:22, color:C.white, fontWeight:700, letterSpacing:"0.01em" }}>
                {fullName}
              </span>
              {profile.verified && (
                <span style={{
                  background:"linear-gradient(135deg, #FFD700, #FFA500)",
                  color:"#1A0A00", fontSize:10, fontWeight:800,
                  padding:"2px 8px", borderRadius:20, letterSpacing:"0.05em", flexShrink:0,
                }}>✨ VÉRIFIÉ</span>
              )}
            </div>
            <div style={{ fontFamily:T.body, fontSize:13, color:C.goldL, marginBottom:8, fontWeight:500 }}>
              {profile.jobTitle || "Freelance — ajoute ton titre métier"}
            </div>
            {profile.tjm && (
              <div style={{
                display:"inline-flex", alignItems:"center", gap:6,
                background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 12px",
              }}>
                <span style={{ fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em" }}>TJM</span>
                <span style={{ fontFamily:T.display, fontSize:15, color:C.white, fontWeight:600 }}>{profile.tjm} €</span>
              </div>
            )}
          </div>

          <button onClick={onBack} style={{
            position:"absolute", top:0, right:0,
            background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
            borderRadius:8, padding:"6px 12px", cursor:"pointer",
            fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:500,
          }}>← Retour</button>
        </div>

        {profile.skills.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:16 }}>
            {profile.skills.slice(0,6).map(s => (
              <span key={s} style={{
                background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
                borderRadius:20, padding:"4px 12px",
                fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.9)", fontWeight:500,
              }}>{s}</span>
            ))}
            {profile.skills.length > 6 && (
              <span style={{ fontFamily:T.body, fontSize:11, color:"rgba(255,255,255,0.5)", padding:"4px 8px" }}>+{profile.skills.length - 6}</span>
            )}
          </div>
        )}
      </div>

      {/* Section nav tabs */}
      <div className="fade-up fade-up-1" style={{
        display:"flex", gap:8, marginBottom:24,
        background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:6,
        boxShadow:"0 2px 8px #1B2E4B06",
      }}>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              flex:1, padding:"10px 8px",
              background: activeSection === sec.id ? C.navy : "transparent",
              border:"none", borderRadius:8, cursor:"pointer",
              fontFamily:T.body, fontSize:12, fontWeight:600,
              color: activeSection === sec.id ? C.white : C.textM,
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              transition:"all 0.18s",
            }}
          >
            <span>{sec.icon}</span>{sec.label}
          </button>
        ))}
      </div>

      {/* IDENTITY */}
      {activeSection === "identity" && (
        <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:20 }}>PHOTO & IDENTITÉ</div>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                display:"flex", alignItems:"center", gap:16,
                background:C.creamD, border:`2px dashed ${C.border}`,
                borderRadius:12, padding:"16px 20px", cursor:"pointer", marginBottom:20,
                transition:"all 0.18s",
              }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.background=C.creamDD; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.creamD; }}
            >
              <div style={{ width:52, height:52, borderRadius:"50%", background: profile.photo ? "transparent" : C.navy, border:`2px solid ${C.border}`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {profile.photo ? <img src={profile.photo} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:22 }}>📷</span>}
              </div>
              <div>
                <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy, marginBottom:3 }}>
                  {profile.photo ? "Changer la photo de profil" : "Ajouter une photo de profil"}
                </div>
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>JPG, PNG — max 5 Mo</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:14, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>PRÉNOM</label>
                <input style={inputStyle} value={profile.firstName} placeholder="Jean" onChange={e => updateProfile("firstName", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              </div>
              <div>
                <label style={labelStyle}>NOM</label>
                <input style={inputStyle} value={profile.lastName} placeholder="Dupont" onChange={e => updateProfile("lastName", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.creamD, borderRadius:10, padding:"14px 16px" }}>
              <div>
                <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy, marginBottom:2 }}>Compte Vérifié ✨</div>
                <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>Affiche un badge de confiance sur ton profil</div>
              </div>
              <div
                onClick={() => updateProfile("verified", !profile.verified)}
                style={{ width:44, height:24, borderRadius:12, background: profile.verified ? C.navy : C.creamDD, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}
              >
                <div style={{ position:"absolute", top:3, left: profile.verified ? 22 : 3, width:18, height:18, borderRadius:"50%", background:C.white, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METIER */}
      {activeSection === "metier" && (
        <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:20 }}>PRÉSENTATION MÉTIER</div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>TITRE DU MÉTIER</label>
              <input style={inputStyle} value={profile.jobTitle} placeholder="Développeur web fullstack" onChange={e => updateProfile("jobTitle", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>BIOGRAPHIE / PRÉSENTATION</label>
              <textarea value={profile.bio} onChange={e => updateProfile("bio", e.target.value)} placeholder="Décris ce que tu fais, ta spécialité, tes valeurs…" rows={5} style={{ ...inputStyle, resize:"vertical", lineHeight:1.65, minHeight:100, maxHeight:240 }} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>NUMÉRO SIRET</label>
              <input style={inputStyle} value={profile.siret} placeholder="123 456 789 00012" onChange={e => updateProfile("siret", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div>
              <label style={labelStyle}>TJM — TARIF JOURNALIER MOYEN</label>
              <div style={{ position:"relative" }}>
                <input type="number" style={{ ...inputStyle, paddingRight:40 }} value={profile.tjm} placeholder="450" onChange={e => updateProfile("tjm", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
                <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontFamily:T.body, fontSize:14, fontWeight:600, color:C.textL }}>€/j</span>
              </div>
            </div>
          </div>

          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:16 }}>COMPÉTENCES</div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              <input style={{ ...inputStyle, flex:1 }} value={newSkill} placeholder="React, Node.js, Figma…" onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              <button onClick={addSkill} style={{ padding:"12px 18px", background:C.navy, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:600, flexShrink:0 }}>+ Ajouter</button>
            </div>
            {profile.skills.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 16px", fontFamily:T.body, fontSize:12, color:C.textL, background:C.creamD, borderRadius:10 }}>Ajoute tes compétences pour qu'elles apparaissent sur ton profil</div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {profile.skills.map(skill => (
                  <div key={skill} style={{ display:"flex", alignItems:"center", gap:6, background:C.creamD, border:`1.5px solid ${C.border}`, borderRadius:20, padding:"6px 12px", fontFamily:T.body, fontSize:12, fontWeight:500, color:C.navy }}>
                    {skill}
                    <span onClick={() => removeSkill(skill)} style={{ cursor:"pointer", fontSize:14, lineHeight:1, color:C.textL }}>×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FACTURATION */}
      {activeSection === "facturation" && (
        <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Coordonnées bancaires */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:6 }}>COORDONNÉES BANCAIRES</div>
            <div style={{ fontFamily:T.body, fontSize:11.5, color:C.textL, lineHeight:1.5, marginBottom:18 }}>Ces informations apparaîtront sur tes factures pour que le client sache où te payer.</div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>IBAN</label>
              <input style={inputStyle} value={profile.iban} placeholder="FR76 3000 1007 9412 3456 7890 185" onChange={e => updateProfile("iban", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={labelStyle}>BIC / SWIFT</label>
                <input style={inputStyle} value={profile.bic} placeholder="BNPAFRPP" onChange={e => updateProfile("bic", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              </div>
              <div>
                <label style={labelStyle}>BANQUE</label>
                <input style={inputStyle} value={profile.bankName} placeholder="BNP Paribas" onChange={e => updateProfile("bankName", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              </div>
            </div>
          </div>

          {/* Mentions légales */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:6 }}>MENTIONS LÉGALES</div>
            <div style={{ fontFamily:T.body, fontSize:11.5, color:C.textL, lineHeight:1.5, marginBottom:18 }}>Obligatoires sur tes contrats et factures en France.</div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>RAISON SOCIALE / NOM COMMERCIAL</label>
              <input style={inputStyle} value={profile.companyName} placeholder="Jean Dupont EI" onChange={e => updateProfile("companyName", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>STATUT JURIDIQUE</label>
              <select style={{ ...inputStyle, cursor:"pointer" }} value={profile.legalStatus} onChange={e => updateProfile("legalStatus", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border}>
                <option value="">Sélectionner…</option>
                <option value="Micro-entreprise">Micro-entreprise (auto-entrepreneur)</option>
                <option value="Entreprise Individuelle (EI)">Entreprise Individuelle (EI)</option>
                <option value="EURL">EURL</option>
                <option value="SASU">SASU</option>
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="Profession libérale">Profession libérale</option>
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>ADRESSE PROFESSIONNELLE</label>
              <input style={inputStyle} value={profile.address} placeholder="12 rue de la République, 75001 Paris" onChange={e => updateProfile("address", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div>
              <label style={labelStyle}>N° TVA INTRACOMMUNAUTAIRE</label>
              <input style={inputStyle} value={profile.tvaNumber} placeholder="FR 12 345678900 (laisser vide si non assujetti)" onChange={e => updateProfile("tvaNumber", e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
              <div style={{ fontFamily:T.body, fontSize:10.5, color:C.textL, marginTop:6, lineHeight:1.4 }}>Micro-entreprise non assujettie ? Laisse vide : la mention « TVA non applicable, art. 293 B du CGI » sera ajoutée automatiquement.</div>
            </div>
          </div>

          {/* Logo entreprise */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
            <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:6 }}>LOGO PROFESSIONNEL</div>
            <div style={{ fontFamily:T.body, fontSize:11.5, color:C.textL, lineHeight:1.5, marginBottom:18 }}>Ton logo apparaîtra en en-tête de tes contrats et factures.</div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:72, height:72, borderRadius:12, border:`1.5px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:C.creamD, flexShrink:0 }}>
                {profile.logo ? <img src={profile.logo} alt="logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <span style={{ fontSize:26 }}>🏢</span>}
              </div>
              <div style={{ flex:1 }}>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
                <button onClick={() => logoInputRef.current?.click()} style={{ padding:"10px 18px", background:C.navy, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:13, fontWeight:600 }}>
                  {profile.logo ? "Changer le logo" : "Ajouter un logo"}
                </button>
                {profile.logo && <button onClick={() => updateProfile("logo", null)} style={{ marginLeft:8, padding:"10px 14px", background:"none", color:C.textM, border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:T.body, fontSize:12 }}>Retirer</button>}
                <div style={{ fontFamily:T.body, fontSize:10.5, color:C.textL, marginTop:8 }}>PNG, JPG — max 2 Mo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIENS */}
      {activeSection === "liens" && (
        <div className="fade-up" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06" }}>
          <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:20 }}>LIENS & RÉSEAUX</div>
          {[
            { key:"linkedin", label:"LINKEDIN", icon:"💼", placeholder:"https://linkedin.com/in/ton-profil" },
            { key:"portfolio", label:"PORTFOLIO / SITE WEB", icon:"🌐", placeholder:"https://ton-portfolio.fr" },
            { key:"github", label:"GITHUB", icon:"⌨", placeholder:"https://github.com/ton-username" },
          ].map(({ key, label, icon, placeholder }) => (
            <div key={key} style={{ marginBottom:14 }}>
              <label style={labelStyle}>{icon} {label}</label>
              <div style={{ position:"relative" }}>
                <input style={inputStyle} value={profile[key] || ""} placeholder={placeholder} onChange={e => updateProfile(key, e.target.value)} onFocus={e => e.target.style.borderColor=C.navy} onBlur={e => e.target.style.borderColor=C.border} />
                {profile[key] && (
                  <a href={profile[key]} target="_blank" rel="noopener noreferrer" style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontFamily:T.body, fontSize:10, color:C.navy, fontWeight:600, textDecoration:"none", background:C.creamD, padding:"3px 8px", borderRadius:6, border:`1px solid ${C.border}` }}>Ouvrir ↗</a>
                )}
              </div>
            </div>
          ))}
          {(profile.linkedin || profile.portfolio || profile.github) && (
            <div style={{ marginTop:20, background:C.creamD, borderRadius:12, padding:"16px 18px", border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.12em", color:C.textL, fontWeight:600, marginBottom:12 }}>APERÇU DES LIENS</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:C.white, border:"1.5px solid #0077B5", borderRadius:8, padding:"8px 14px", textDecoration:"none", fontFamily:T.body, fontSize:12, fontWeight:600, color:"#0077B5" }}>💼 LinkedIn</a>}
                {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:C.white, border:`1.5px solid ${C.navy}`, borderRadius:8, padding:"8px 14px", textDecoration:"none", fontFamily:T.body, fontSize:12, fontWeight:600, color:C.navy }}>🌐 Portfolio</a>}
                {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:C.white, border:"1.5px solid #333", borderRadius:8, padding:"8px 14px", textDecoration:"none", fontFamily:T.body, fontSize:12, fontWeight:600, color:"#333" }}>⌨ GitHub</a>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liaison magique */}
      <div className="fade-up fade-up-2" style={{ display:"flex", alignItems:"flex-start", gap:12, background:"linear-gradient(135deg, #FFFBEB 0%, #FFF7E6 100%)", border:"1px solid #FDE68A", borderRadius:12, padding:"16px 18px", marginTop:20 }}>
        <span style={{ fontSize:20, flexShrink:0 }}>✨</span>
        <div>
          <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:"#92400E", marginBottom:4 }}>Liaison magique activée</div>
          <div style={{ fontFamily:T.body, fontSize:12, color:"#92400E", lineHeight:1.6, opacity:0.85 }}>
            Ton nom, ton titre et ton SIRET remplissent automatiquement tes contrats. Ta photo et ton nom apparaissent dans la navigation et sur la facture d'acompte.
          </div>
        </div>
      </div>

      {/* ── SECTION ABONNEMENT ── */}
      <div className="fade-up fade-up-2" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px #1B2E4B06", marginTop:24 }}>
        <div style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.18em", color:C.gold, fontWeight:700, marginBottom:18 }}>ABONNEMENT & FACTURATION</div>

        {/* Forfait actuel */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.creamD, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:T.body, fontSize:13, fontWeight:700, color:C.navy, marginBottom:3 }}>
              {isPremium
                ? (premiumPlan === "yearly" ? "Forfait Pro Annuel 🚀" : "Forfait Pro Mensuel ⚡")
                : "Forfait Gratuit"}
            </div>
            <div style={{ fontFamily:T.body, fontSize:11, color:C.textL }}>
              {isPremium
                ? (premiumPlan === "yearly" ? "99 €/an · Contrats illimités" : "14,99 €/mois · Contrats illimités")
                : "2 contrats offerts pour tester"}
            </div>
          </div>
          <div style={{
            background: isPremium ? "linear-gradient(135deg, #1B2E4B 0%, #2D4A7A 100%)" : C.creamDD,
            color: isPremium ? C.white : C.textM,
            fontFamily:T.body, fontSize:11, fontWeight:700,
            padding:"5px 12px", borderRadius:20, letterSpacing:"0.05em",
          }}>
            {isPremium ? "ACTIF" : "GRATUIT"}
          </div>
        </div>

        {/* Bouton Stripe */}
        <button
          onClick={() => alert("La gestion d'abonnement et de facturation par carte (Stripe) sera disponible prochainement.")}
          style={{
            width:"100%", padding:"13px 18px",
            background:C.white, border:`1.5px solid ${C.border}`,
            borderRadius:12, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            fontFamily:T.body, fontSize:13, fontWeight:600, color:C.navy,
            transition:"all 0.18s", boxShadow:"0 1px 4px #1B2E4B08",
          }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor=C.navy; e.currentTarget.style.boxShadow="0 4px 16px #1B2E4B14"; }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow="0 1px 4px #1B2E4B08"; }}
        >
          <span style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>💳</span>
            Gérer mon abonnement & Factures
          </span>
          <span style={{ fontSize:12, color:C.textL }}>↗</span>
        </button>
        <div style={{ fontFamily:T.body, fontSize:11, color:C.textL, marginTop:10, lineHeight:1.6, textAlign:"center" }}>
          Vous pouvez suspendre votre abonnement ou modifier vos informations de paiement à tout moment via l'espace sécurisé Stripe.
        </div>
      </div>

      {/* ── ZONE DE DANGER ── */}
      <div className="fade-up fade-up-2" style={{ marginTop:32 }}>
        {/* Séparateur */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:`${C.border}` }} />
          <span style={{ fontFamily:T.body, fontSize:10, letterSpacing:"0.15em", color:"#EF4444", fontWeight:700 }}>ZONE DE DANGER</span>
          <div style={{ flex:1, height:1, background:`${C.border}` }} />
        </div>

        <div style={{ background:"#FFF5F5", border:"1px solid #FEE2E2", borderRadius:16, padding:"20px 24px" }}>
          <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:"#991B1B", marginBottom:6 }}>
            Suppression du compte
          </div>
          <div style={{ fontFamily:T.body, fontSize:12, color:"#B91C1C", lineHeight:1.6, marginBottom:16, opacity:0.85 }}>
            Cette action est permanente et irréversible. Toutes vos données seront effacées conformément au RGPD.
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display:"flex", alignItems:"center", gap:8,
              background:"transparent", border:"1.5px solid #EF4444",
              borderRadius:10, padding:"10px 18px", cursor:"pointer",
              fontFamily:T.body, fontSize:13, fontWeight:600, color:"#EF4444",
              transition:"all 0.18s",
            }}
            onMouseOver={e=>{ e.currentTarget.style.background="#EF4444"; e.currentTarget.style.color="#fff"; }}
            onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#EF4444"; }}
          >
            <span>🗑️</span> Supprimer définitivement mon compte
          </button>
        </div>
      </div>

      {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
      {showDeleteModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:9999,
          background:"rgba(10,15,30,0.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:20,
        }}
          onClick={e => { if (e.target === e.currentTarget && !deleteConfirming) setShowDeleteModal(false); }}
        >
          <div style={{
            background:C.white, borderRadius:20, padding:"24px 16px",
            maxWidth:400, width:"100%",
            boxShadow:"0 24px 80px rgba(0,0,0,0.25)",
            animation:"fadeInUp 0.22s ease",
          }}>
            {deleteConfirming ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🗑️</div>
                <div style={{ fontFamily:T.display, fontSize:18, fontWeight:700, color:C.navy, marginBottom:10 }}>
                  Suppression en cours…
                </div>
                <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.6 }}>
                  Déconnexion… Votre compte a bien été supprimé.
                </div>
                <div style={{ marginTop:20, display:"flex", justifyContent:"center" }}>
                  <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontSize:44, marginBottom:12 }}>⚠️</div>
                  <div style={{ fontFamily:T.display, fontSize:20, fontWeight:700, color:C.navy, marginBottom:10 }}>
                    Supprimer votre compte ?
                  </div>
                  <div style={{ fontFamily:T.body, fontSize:13, color:C.textM, lineHeight:1.7 }}>
                    Attention, cette action est <strong>irréversible</strong>. Toutes vos données, vos scans et vos contrats générés seront définitivement effacés de nos serveurs sécurisés conformément au RGPD.
                  </div>
                </div>
                <div style={{ display:"flex", gap:12, marginTop:8 }}>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    style={{
                      flex:1, padding:"13px 16px",
                      background:"#F3F4F6", border:"none", borderRadius:12,
                      cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:600,
                      color:C.textM, transition:"background 0.18s",
                    }}
                    onMouseOver={e=>e.currentTarget.style.background="#E5E7EB"}
                    onMouseOut={e=>e.currentTarget.style.background="#F3F4F6"}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      flex:1, padding:"13px 16px",
                      background:"linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                      border:"none", borderRadius:12,
                      cursor:"pointer", fontFamily:T.body, fontSize:14, fontWeight:700,
                      color:"#fff", boxShadow:"0 4px 16px #EF444440",
                      transition:"opacity 0.18s",
                    }}
                    onMouseOver={e=>e.currentTarget.style.opacity="0.88"}
                    onMouseOut={e=>e.currentTarget.style.opacity="1"}
                  >
                    Confirmer la suppression
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save button */}
      <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:100 }}>
        <button onClick={handleSave} style={{
          padding:"14px 40px",
          background: saved ? "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)" : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
          color:C.white, border:"none", borderRadius:50, cursor:"pointer",
          fontFamily:T.body, fontSize:14, fontWeight:700,
          boxShadow:"0 8px 32px #1B2E4B40",
          transition:"all 0.25s",
          display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap",
        }}>
          {saved ? <><span>✓</span> Profil enregistré !</> : <><span>💾</span> Enregistrer le profil</>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ ROOT EXPORT ══ */
function ClientSignaturePage({ contractId }) {
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const [hasStrokes, setHasStrokes] = useState(false);
  const drawing = useRef(false);

  useEffect(() => {
    getContractForSigning(contractId)
      .then(data => {
        if (!data) { setError("Contrat introuvable ou lien expiré."); }
        else if (data.status === "signed") { setError("Ce contrat a déjà été signé. Merci !"); }
        else { setContractData(data); }
        setLoading(false);
      })
      .catch(() => { setError("Erreur de chargement."); setLoading(false); });
  }, [contractId]);

  // Dessin signature
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: (touch.clientX - rect.left) * (canvas.width / rect.width), y: (touch.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startDraw = (e) => { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = getPos(e);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#1B2E4B"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    setHasStrokes(true);
  };
  const endDraw = () => { drawing.current = false; };
  const clearCanvas = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); setHasStrokes(false); };

  const handleSign = async () => {
    if (!hasStrokes) return;
    setSigning(true);
    const sig = canvasRef.current.toDataURL("image/png");
    const ok = await submitClientSignature(contractId, sig);
    setSigning(false);
    if (ok) setDone(true);
    else setError("Erreur lors de l'enregistrement. Réessaie.");
  };

  const wrap = { minHeight:"100vh", background:"#F5F1E8", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px", fontFamily:"'DM Sans', sans-serif" };

  if (loading) return <div style={{ ...wrap, justifyContent:"center" }}><div style={{ color:"#1B2E4B", fontSize:15 }}>Chargement du contrat…</div></div>;

  if (error) return (
    <div style={{ ...wrap, justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, maxWidth:420, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:38, marginBottom:12 }}>{error.includes("déjà") ? "✅" : "⚠️"}</div>
        <div style={{ fontSize:15, color:"#1B2E4B", lineHeight:1.5 }}>{error}</div>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ ...wrap, justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:36, maxWidth:420, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:20, fontWeight:700, color:"#1B2E4B", marginBottom:10 }}>Contrat signé !</div>
        <div style={{ fontSize:14, color:"#5A6B80", lineHeight:1.6 }}>Merci. Ta signature a bien été enregistrée. Le prestataire en est informé et recevra le contrat signé.</div>
      </div>
    </div>
  );

  const content = contractData?.content || {};
  const contractText = content.contract || "";

  return (
    <div style={wrap}>
      <div style={{ width:"100%", maxWidth:560 }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#1B2E4B", fontFamily:"'Playfair Display', serif" }}>Freeley</div>
          <div style={{ fontSize:13, color:"#5A6B80", marginTop:4 }}>Signature électronique du contrat</div>
        </div>

        <div style={{ background:"#fff", borderRadius:14, padding:"22px 20px", marginBottom:16, boxShadow:"0 4px 24px rgba(27,46,75,0.08)" }}>
          <div style={{ fontSize:11, letterSpacing:"0.1em", color:"#B8965A", fontWeight:700, marginBottom:12 }}>CONTRAT À SIGNER</div>
          <div style={{ maxHeight:340, overflowY:"auto", fontSize:12.5, color:"#2C3E50", lineHeight:1.7, whiteSpace:"pre-wrap", background:"#FAF8F3", padding:"16px", borderRadius:8, border:"1px solid #E8E0D0" }}>
            {contractText || "Contenu du contrat indisponible."}
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:14, padding:"22px 20px", boxShadow:"0 4px 24px rgba(27,46,75,0.08)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1B2E4B", marginBottom:6 }}>Ta signature</div>
          <div style={{ fontSize:12, color:"#5A6B80", marginBottom:12, lineHeight:1.5 }}>Signe ci-dessous avec ton doigt (ou ta souris) pour accepter les termes de ce contrat.</div>
          <canvas
            ref={canvasRef}
            width={520} height={180}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            style={{ width:"100%", height:180, border:"2px dashed #C9A961", borderRadius:10, background:"#FFFDF9", touchAction:"none", cursor:"crosshair" }}
          />
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <button onClick={clearCanvas} style={{ flex:"0 0 auto", padding:"12px 18px", background:"#F5F1E8", border:"1.5px solid #E8E0D0", borderRadius:10, cursor:"pointer", fontSize:13, color:"#5A6B80", fontWeight:500 }}>Effacer</button>
            <button
              onClick={handleSign}
              disabled={!hasStrokes || signing}
              style={{ flex:1, padding:"12px 18px", background: (hasStrokes && !signing) ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)" : "#D1D5DB", border:"none", borderRadius:10, cursor: (hasStrokes && !signing) ? "pointer" : "not-allowed", fontSize:14, fontWeight:700, color:"#fff" }}
            >{signing ? "Enregistrement…" : "✓ Signer le contrat"}</button>
          </div>
          <div style={{ fontSize:10.5, color:"#9CA3AF", marginTop:14, lineHeight:1.5, textAlign:"center" }}>
            En signant, tu acceptes les termes de ce contrat. Signature horodatée et conservée conformément au droit français.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Lien de signature client : ?sign=<contractId>
  const signParam = new URLSearchParams(window.location.search).get("sign");
  if (signParam) {
    return (
      <ErrorBoundary>
        <ClientSignaturePage contractId={signParam} />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

