/**
 * File upload and processing services
 */

/**
 * Process file for upload
 *
 * @param {File} file - File object from input
 * @param {Function} progressCallback - Callback for upload progress
 * @returns {Promise<Object>} - Promise resolving to processed file object
 */
export async function processFile(file, progressCallback = () => {}) {
    return new Promise((resolve, reject) => {
        try {
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressCallback(progress);

                if (progress >= 100) {
                    clearInterval(interval);

                    // Create file object with preview for images
                    const fileObj = {
                        id: `file_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        file: file, // Store the actual file object for API calls
                        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                    };

                    resolve(fileObj);
                }
            }, 100);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Process multiple files for upload
 *
 * @param {FileList|Array} files - Files from input element
 * @param {Function} progressCallback - Callback for upload progress
 * @returns {Promise<Array>} - Promise resolving to array of processed file objects
 */
export async function processFiles(files, progressCallback = () => {}) {
    const fileArray = Array.from(files);
    const processedFiles = [];

    // Process each file sequentially for more predictable progress reporting
    for (const file of fileArray) {
        const processedFile = await processFile(file, progressCallback);
        processedFiles.push(processedFile);
    }

    return processedFiles;
}

/**
 * Get file size in human-readable format
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
export function getHumanReadableSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file icon based on mime type
 *
 * @param {string} mimeType - File mime type
 * @returns {string} - Icon name for file type
 */
export function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
        return 'image';
    } else if (mimeType.startsWith('video/')) {
        return 'video';
    } else if (mimeType.startsWith('audio/')) {
        return 'audio';
    } else if (mimeType.includes('pdf')) {
        return 'pdf';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
        return 'document';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        return 'spreadsheet';
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
        return 'presentation';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
        return 'archive';
    } else if (mimeType.includes('text/') || mimeType.includes('code')) {
        return 'text';
    } else {
        return 'file';
    }
}

/**
 * Check if file is within size limits
 *
 * @param {File} file - File to check
 * @param {number} maxSizeInBytes - Maximum allowed size in bytes
 * @returns {boolean} - True if file is within size limits
 */
export function isFileSizeValid(file, maxSizeInBytes = 25 * 1024 * 1024) { // Default 25MB
    return file.size <= maxSizeInBytes;
}

/**
 * Check if file type is allowed
 *
 * @param {File} file - File to check
 * @param {Array} allowedTypes - Array of allowed mime type patterns (e.g. 'image/*')
 * @returns {boolean} - True if file type is allowed
 */
export function isFileTypeAllowed(file, allowedTypes = ['*/*']) {
    if (allowedTypes.includes('*/*')) {
        return true;
    }

    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return file.type.startsWith(`${category}/`);
        }
        return file.type === type;
    });
}