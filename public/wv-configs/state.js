((exports) => {
  let signer = null;
  let signers = [];
  let signerSigInits = {};
  let locked = false;

  const { Promise, R, _ } = exports.getExternalLibs()

  exports.setSigners = (s) => {
    console.log('setSigners called', s);
    signers = s;
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