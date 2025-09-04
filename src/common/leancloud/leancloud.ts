import * as AV from 'leanengine';

import { config } from '../../../config';

AV.init(config.leancloud);

export { AV };
