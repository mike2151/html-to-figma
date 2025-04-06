export function displaySuccessMessage(message: string) {
    figma.ui.postMessage({
        type: "success",
        message,
    });
}

export function displayErrorMessage(message: string) {
    figma.ui.postMessage({
        type: "error",
        message,
    });
}