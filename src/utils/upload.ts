/**
 * Mock 版上传：把 File 转成 DataURL 返回，避免搭后端 OSS。
 * 真实环境接到后端后，把这里换成 post FormData 即可。
 */
export function uploadFile(file: File): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
