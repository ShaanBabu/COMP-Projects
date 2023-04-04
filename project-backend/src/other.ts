import { getData, setData } from './dataStore';

/**
 * @description Resets the internal data of the application to its initial state.
 * @returns {Object<{}>}
 */
function clearV1(): object {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  setData(data);

  return {};
}

export { clearV1 };
