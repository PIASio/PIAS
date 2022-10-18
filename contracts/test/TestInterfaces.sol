// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.16;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../interfaces/IPias.sol";

contract TestInterfaceId {
	function getIPiasId() external pure returns (bytes4) {
		return type(IPias).interfaceId;
	}

	function getIAccessControlEnumerableUpgradeableId()
		external
		pure
		returns (bytes4)
	{
		return type(IAccessControlEnumerableUpgradeable).interfaceId;
	}

	function getIERC20MetadataUpgradeableId() external pure returns (bytes4) {
		return type(IERC20MetadataUpgradeable).interfaceId;
	}

	function getIERC20UpgradeableId() external pure returns (bytes4) {
		return type(IERC20Upgradeable).interfaceId;
	}
}
