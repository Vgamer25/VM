import * as CheerpX from
    "https://cxrtnc.leaningtech.com/1.2.8/cx.esm.js";


const canvas = document.getElementById("display");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");


let cx = null;


/*
 * Show an error on the webpage.
 */
function showError(error) {

    console.error(error);

    loading.style.display = "none";

    errorBox.style.display = "block";

    errorBox.textContent =
        "Linux VM failed to start.\n\n" +
        String(error) +
        "\n\n" +
        "Check the browser console for more information.";
}


/*
 * Resize the graphical VM display.
 */
function resizeDisplay() {

    if (!cx) {
        return;
    }

    const width =
        Math.max(1, Math.floor(canvas.clientWidth));

    const height =
        Math.max(1, Math.floor(canvas.clientHeight));


    /*
     * Tell CheerpX to render graphical output
     * into our canvas.
     */
    cx.setKmsCanvas(
        canvas,
        width,
        height
    );
}


/*
 * Start the CheerpX VM.
 */
async function startVM() {

    try {

        /*
         * ----------------------------------------------------
         * 1. Load the Linux disk image
         * ----------------------------------------------------
         *
         * Replace this URL with your own .ext2 image.
         *
         * Your image needs to contain the graphical Linux
         * environment that you want to boot.
         */

        const blockDevice =
            await CheerpX.HttpBytesDevice.create(
                "/cheerpXImage.ext2"
            );


        /*
         * ----------------------------------------------------
         * 2. Persistent writable layer
         * ----------------------------------------------------
         *
         * Changes made by the VM are stored in IndexedDB.
         */

        const persistentDevice =
            await CheerpX.IDBDevice.create(
                "browser-linux-vm"
            );


        /*
         * Combine the read-only Linux image with
         * the persistent writable filesystem.
         */

        const overlayDevice =
            await CheerpX.OverlayDevice.create(
                blockDevice,
                persistentDevice
            );


        /*
         * ----------------------------------------------------
         * 3. Create the Linux virtual machine
         * ----------------------------------------------------
         */

        cx =
            await CheerpX.Linux.create({

                mounts: [

                    {
                        type: "ext2",
                        path: "/",
                        dev: overlayDevice
                    },

                    {
                        type: "devs",
                        path: "/dev"
                    },

                    {
                        type: "proc",
                        path: "/proc"
                    }

                ]

            });


        /*
         * ----------------------------------------------------
         * 4. Attach graphical output
         * ----------------------------------------------------
         */

        resizeDisplay();


        /*
         * ----------------------------------------------------
         * 5. Start the graphical Linux environment
         * ----------------------------------------------------
         *
         * IMPORTANT:
         *
         * This command must exist in your Linux image.
         *
         * For example, your image could be configured to
         * start Xorg or another graphical environment.
         *
         * Replace this command with the appropriate command
         * for your image.
         */

        await cx.run(
            "/usr/bin/Xorg",
            [],
            {
                cwd: "/",
                uid: 0,
                gid: 0
            }
        );


        loading.style.display = "none";


        /*
         * Give the canvas keyboard focus.
         */

        canvas.focus();


    } catch (error) {

        showError(error);

    }

}


/*
 * Resize the VM when the browser window changes size.
 */

window.addEventListener(
    "resize",
    resizeDisplay
);


/*
 * Clicking the VM display gives it focus.
 */

canvas.addEventListener(
    "click",
    () => {
        canvas.focus();
    }
);


/*
 * Start VM.
 */

startVM();
