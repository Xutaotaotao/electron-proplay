import {getInstalledApps} from 'get-installed-apps'

export const getApps = async () => {
  const apps = await getInstalledApps()
  return apps
}