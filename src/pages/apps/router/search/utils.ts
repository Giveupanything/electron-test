export function generateChineseUpperCase(count: number) {
  const numArray = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]; // 中文数字字符

  function toChineseUpperCase(num: number) {
    let str = num.toString(); // 将数字转换为字符串
    let result = "";

    for (let i = 0; i < str.length; i++) {
      const n = parseInt(str[i]);
      result += numArray[n]; // 直接用中文字符来表示数字
    }

    return result;
  }

  const resultArray = [];
  for (let i = 1; i <= count; i++) {
    resultArray.push(toChineseUpperCase(i)); // 将指定数量的大写数字添加到数组中
  }

  return resultArray;
}

export function handleDownload(blob: Blob, filename: string) {
  if (!!(window.navigator as any).msSaveOrOpenBlob) {
    // 兼容 ie10+
    (window.navigator as any).msSaveBlob(blob, filename);
  } else {
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename || url;
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
