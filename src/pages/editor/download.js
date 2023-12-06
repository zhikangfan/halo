import { v4 as uuid } from 'uuid';

const downFile =  (fileStr, fileType) => {
    const anchorEl = document.createElement('a');
    anchorEl.href = fileStr;
    anchorEl.download = `${uuid()}.${fileType}`;
    document.body.appendChild(anchorEl); // required for firefox
    anchorEl.click();
    anchorEl.remove();
}

export default downFile