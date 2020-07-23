import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

interface Update {
    homepage: string,
    promos: {
        [version: string]: string,
    },
}

interface Releases {
    [release: string]: Release,
}

interface Release {
    // rank download urls
    admin: string,
    mod: string,
    expert: string,
    support: string,
    default: string,

    notes: string,
    release: string,
    mcRelease: string,
}

export const getUpdateJSON = functions.https.onRequest(async (request, response) => {
    admin.initializeApp();
    const recommendedSnapshot:string = (await admin.database().ref("recommended").once('value')).val();
    const releasesSnapshot:Releases = (await admin.database().ref("releases").once('value')).val();

    const update:Update = {
        homepage: "https://dfplusplus.github.io/webpage/downloads/",
        promos: {}
    }

    const foundMcReleases:{[mcVersion: string]:boolean} = {hello: true};

    const releaseVersions = Object.keys(releasesSnapshot);
    releaseVersions.reverse();

    for (const releaseVersion of releaseVersions) {
        const formattedReleaseVersion = releaseVersion.replace(/-/g,".");
        const release = releasesSnapshot[releaseVersion];
        let isLatest = false;
        let isRecommended = false;

        // if this minecraft version has not been seen yet
        if (!foundMcReleases[release.mcRelease]) {
            isLatest = true;
            foundMcReleases[release.mcRelease] = true;
        }

        // if this version = the recommended, fetched earlier
        if (releaseVersion === recommendedSnapshot) 
            isRecommended = true;

        // if this version is special, add it to promos
        if (isLatest) {
            update.promos[`${release.mcRelease}-latest`] = formattedReleaseVersion;
        }
        if (isRecommended) {
            update.promos[`${release.mcRelease}-recommended`] = formattedReleaseVersion;
        }
    }

    response.send(update)
});
