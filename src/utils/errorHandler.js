/**
 * 全局代码错误捕捉（委托给 logger 统一通道）
 * 比如 null.length 就会被捕捉到
 */
import logger from '@/utils/logger'

export default (error, vm) => {
	logger.codeError(error, vm)
};
