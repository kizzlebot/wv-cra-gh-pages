((exports) => {
  let signer = null;
  let signers = [];
  let signerSigInits = {};
  let locked = false;
  const { Annotations, Tools, PDFNet } = exports;

  const colors = [
    new Annotations.Color(255, 10, 102, 0.5),
    new Annotations.Color(255, 87, 126, 0.5),
    new Annotations.Color(38, 79, 120, 0.5),
    new Annotations.Color(239, 106, 70, 0.5),
    new Annotations.Color(227, 73, 67, 0.5),
    new Annotations.Color(153, 215, 114, 0.5),
    new Annotations.Color(91, 215, 227, 0.5),
    new Annotations.Color(91, 215, 227, 0.5),
    new Annotations.Color(160, 146, 236, 0.5),
  ]

  const { Promise, R, _ } = exports.getExternalLibs()

  exports.setSigners = (s) => {
    // console.log('setSigners called', s);
    signers = _.map(s, (signer, i) => {
      return {
        ...signer,
        color: colors[i % colors.length]
      }
    });
    return signers;
  };

  exports.setSigner = (s) => {
    signer = s;
    return signer;
  };
  exports.getSigner = (s) => signer;

  exports.addSigner = (s) => {
    signers = _.uniqBy([...signers, s], 'id');
    return signers;
  };


  exports.getSigInits = () => signerSigInits;
  exports.updateSignerSigInits = (id, val) => {
    signerSigInits[id] = val;
    return signerSigInits;
  }
  exports.saveSignature = ({ id, type, raw }) => {
    signerSigInits[id] = signerSigInits[id] || {};
    signerSigInits[id][type] = { id, type, raw };
    return signerSigInits;
  };


  exports.getSigners = () => signers;
  exports.setLock = (s) => locked = s;
  exports.getLock = (s) => locked;
  exports.setSignerSigInits = (id, type, raw) => ({
    ...signerSigInits,
    [id]: {
      ...signerSigInits[id],
      [type]: raw || signerSigInits[id]?.[type]
    }
  });
  exports.getSigInits = () => signerSigInits;
  exports.delSignerSigInits = (id, sigType) => ({
    ...signerSigInits,
    [id]: {
      ...(signerSigInits[id] || {}),
      [sigType]: null
    }
  });



})(window);