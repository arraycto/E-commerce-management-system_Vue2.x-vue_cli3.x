<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom','vcenter', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              :key="item1.id"
              v-for="(item1,i1) in scope.row.children"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="8">
                <div class="grid-content bg-purple">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </div>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="16">
                <el-row
                  :class="['bdtop','vcenter']"
                  :key="item2.id"
                  v-for="(item2) in item1.children"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="12">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="12">
                    <el-row :key="item3.id" v-for="item3 in item2.children">
                      <el-tag
                        closable
                        @close="removeRightById(scope.row,item3.id)"
                        type="warning"
                      >{{item3.authName}}</el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <!-- scope.row得到是当前行的角色对象
            包括角色id 角色名 角色描述 还有该角色的所有权限数据children
            {
            "id": 30,
            "roleName": "主管",
            "roleDesc": "技术负责人",
            "children": [
                {
                    "id": 101,
                    "authName": "商品管理",
                    "path": null,
                    "children": [
                        {
                            "id": 104,
                            "authName": "商品列表",
                            "path": null,
                            "children": [
                                {
                                    "id": 105,
                                    "authName": "添加商品",
                                    "path": null
                                }
                            ]
                        }
                    ]
                }
            ]
            }-->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        //'authName'表示要在树形控件中展示文本的数据字段
        label: 'authName',
        //'children'为实现父子嵌套用的属性名
        children: 'children',
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }

      this.rolelist = res.data

      console.log(this.rolelist)
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      // this.getRolesList()
      //此处没有选择用this.getRolesList()获取角色列表的所有信息
      //因为如果获取所有全部渲染的话 删除后扩展列会自动闭合
      //而我们要的只是把当前行的角色下的所有权限数据重新赋值即可
      //这样就只是局部渲染权限数据而已 而不是渲染整个角色列表界面不会让扩展列闭合了
      //此处要避免发生页面的完整渲染
      //！！！好好品味此处
      //后端要配合在删除的时候返回当前角色的删除后的所有权限数据
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }

      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data
      console.log(this.rightslist)
      //初始化一下存id的数组 防止每次点击弹出对话框都会一致增加id
      //所以每次获取三级节点id前要先把数组中之前累积的id清空
      this.defKeys = []
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    // 递归遍历一棵树得到所有没有子节点的叶子节点的id存入数组arr
    // node为根节点 即为当前行的角色对象
    //！！！！！！！！此处为重难点！！！！！！！！
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      // 递归结束的出口
      if (!node.children) {
        return arr.push(node.id)
      }
      //item为和根节点角色对象结构类似的节点
      //一样取调用getLeafKeys方法取遍历
      //一层层的往下遍历直到遍历找到没有children的叶子节
      //把叶子节点id push进数组然后就结束递归
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },

    //可以通过给每次点击分配权限弹出框后先初始化一下存权限id的数组
    //再往id数组里添加新的id
    //所以不用下边的方法 下边的方法是每次关闭弹框清空数组中的id
    /* // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    }, */
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        //使用ES6语法把两个数组先合并成一个数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      //join方法把数组转成以逗号隔开的字符串
      const idStr = keys.join(',')
      //因为之前在showSetRightDialog已经设置了点击分配权限
      //按钮后把当前角色的id赋值给了data中的roleID
      //而确定按钮就在该对话框范围内 所以此时可以直接用this.roleID取到角色id
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
