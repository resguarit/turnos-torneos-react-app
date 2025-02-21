import { Facebook, Instagram, PhoneIcon as WhatsApp } from 'lucide-react'

export function Footer() {

const anio = new Date().getFullYear();

  return (
    <footer className="bg-footer py-3 px-2 sm:px-6 lg:py-4">
      <div className="w-full  mx-auto grid grid-cols-3 items-center">
        {/* Logo Section - Left */}
        <div className="flex items-center text-[10px] sm:text-xs justify-start">
          <p className="text-gray-400">Desarrollado por ResguarIt</p>
        </div>

        {/* Social Media Icons - Center */}
        <div className="flex gap-6 justify-center">
          <a href="https://www.instagram.com" target="_blank" aria-label="Instagram">
            <svg className="h-5 sm:h-6" version="1.0" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet">
              <metadata>
                Created by potrace 1.16, written by Peter Selinger 2001-2019
              </metadata>
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#fff" stroke="none">
                <path d="M1230 5113 c-346 -56 -583 -175 -816 -407 -167 -167 -270 -330 -342
                -541 -71 -208 -67 -111 -67 -1605 0 -1494 -4 -1397 67 -1605 72 -211 175 -374
                342 -541 167 -167 330 -270 541 -342 208 -71 111 -67 1605 -67 1494 0 1397 -4
                1605 67 211 72 374 175 541 342 167 167 270 330 342 541 71 208 67 111 67
                1605 0 1494 4 1397 -67 1605 -72 211 -175 374 -342 541 -167 167 -330 270
                -541 342 -209 71 -94 66 -1575 68 -734 1 -1346 0 -1360 -3z m2658 -473 c195
                -39 331 -111 475 -249 150 -143 236 -299 277 -503 19 -93 20 -141 20 -1328 0
                -1187 -1 -1235 -20 -1328 -41 -204 -127 -360 -277 -503 -144 -138 -280 -210
                -475 -249 -93 -19 -141 -20 -1328 -20 -1187 0 -1235 1 -1328 20 -195 39 -331
                111 -475 249 -150 143 -236 299 -277 503 -19 93 -20 141 -20 1328 0 1187 1
                1235 20 1328 41 204 127 360 277 503 143 137 279 209 471 249 82 17 165 19
                1325 19 1195 1 1242 0 1335 -19z"/>
                <path d="M3849 4257 c-107 -31 -192 -107 -230 -206 -29 -77 -24 -194 12 -265
                125 -254 488 -252 607 2 23 49 27 70 27 147 0 101 -17 149 -80 223 -73 85
                -226 130 -336 99z"/>
                <path d="M2331 3864 c-112 -19 -277 -75 -378 -129 -269 -143 -453 -332 -583
                -600 -100 -207 -125 -322 -125 -575 0 -253 25 -368 125 -575 136 -280 335
                -479 615 -615 207 -100 322 -125 575 -125 253 0 368 25 575 125 171 83 301
                181 417 315 89 102 137 175 198 300 100 207 125 322 125 575 0 194 -12 281
                -57 415 -27 81 -108 247 -155 317 -203 303 -530 515 -883 573 -117 18 -334 18
                -449 -1z m447 -474 c305 -86 526 -308 614 -617 32 -112 32 -314 0 -426 -89
                -311 -308 -530 -619 -619 -112 -32 -314 -32 -426 0 -311 89 -530 308 -619 619
                -32 112 -32 314 0 426 97 339 355 574 700 637 78 15 268 4 350 -20z"/>
              </g>
            </svg>
          </a>

          <a href="https://www.facebook.com" target="_blank" aria-label="Facebook">
            <svg className="h-5 sm:h-6 " version="1.0" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet">
              <metadata>
                Created by potrace 1.16, written by Peter Selinger 2001-2019
              </metadata>
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#fff" stroke="none">
                <path d="M2235 5105 c-462 -60 -885 -237 -1255 -523 -117 -91 -316 -287 -413
                -407 -276 -342 -459 -746 -537 -1186 -28 -156 -39 -531 -21 -702 51 -475 232
                -923 529 -1307 91 -117 287 -316 407 -413 442 -357 1013 -567 1543 -567 l122
                0 0 1000 0 1000 -275 0 -275 0 0 315 0 315 275 0 275 0 0 278 c0 371 17 481
                100 644 78 153 211 272 374 333 149 56 264 67 551 55 120 -6 234 -13 252 -16
                l33 -6 0 -278 0 -278 -227 -4 c-240 -5 -277 -11 -343 -58 -16 -11 -41 -46 -57
                -78 l-28 -57 -3 -267 -4 -268 319 0 318 0 -40 -315 -40 -315 -277 0 -278 0 0
                -954 0 -955 53 15 c267 79 586 245 827 432 117 91 316 287 413 407 276 342
                456 737 534 1175 35 196 44 546 19 750 -91 751 -507 1419 -1141 1836 -329 216
                -695 350 -1085 399 -152 18 -501 18 -645 0z"/>
              </g>
            </svg>
          </a>
          <a href="https://www.whatsapp.com" target="_blank" aria-label="WhatsApp">
            <svg className="h-5 sm:h-6 " version="1.0" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet">
              <metadata>
                Created by potrace 1.16, written by Peter Selinger 2001-2019
              </metadata>
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#fff" stroke="none">
                <path d="M2430 4964 c-499 -43 -916 -197 -1290 -478 -118 -88 -318 -282 -415
                -401 -270 -332 -445 -736 -512 -1175 -21 -142 -23 -480 -4 -620 40 -295 126
                -570 250 -807 l49 -91 -168 -614 c-93 -337 -167 -615 -164 -617 2 -2 286 70
                631 161 l627 165 123 -59 c483 -231 1068 -289 1593 -158 331 83 662 247 927
                460 258 209 507 525 648 825 215 453 282 940 199 1435 -169 1006 -983 1801
                -1996 1950 -124 18 -406 32 -498 24z m424 -430 c422 -58 802 -249 1112 -558
                475 -476 673 -1133 539 -1788 -64 -311 -212 -618 -417 -863 -310 -372 -726
                -608 -1213 -692 -140 -23 -463 -23 -600 0 -255 45 -480 125 -689 246 l-89 51
                -364 -96 c-201 -52 -367 -93 -369 -91 -2 2 39 164 93 360 l97 356 -51 83
                c-270 442 -358 935 -258 1433 141 699 663 1276 1346 1489 289 90 558 112 863
                70z"/>
                <path d="M1678 3681 c-112 -37 -258 -230 -297 -392 -60 -256 18 -513 258 -843
                218 -300 454 -533 713 -703 168 -110 460 -237 653 -284 101 -24 284 -26 369
                -4 132 35 297 147 350 238 35 59 58 159 60 250 1 71 -1 80 -23 96 -48 37 -512
                251 -555 257 -52 8 -54 6 -155 -125 -104 -134 -153 -181 -186 -181 -42 0 -297
                130 -402 206 -50 36 -129 102 -175 147 -139 137 -298 356 -298 411 0 18 19 51
                54 95 109 136 136 181 136 225 0 52 -195 526 -237 575 -28 33 -28 33 -133 37
                -58 2 -117 0 -132 -5z"/>
              </g>
            </svg>
          </a>
        </div>

        {/* Copyright and Credits - Right */}
        <div className="text-gray-400 text-[10px] sm:text-xs text-right">
          <p>© {anio} Rock & Gol. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
