PGDMP  6    1                |            ros-database    16.1    16.0     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16398    ros-database    DATABASE     �   CREATE DATABASE "ros-database" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "ros-database";
                postgres    false            �            1259    16470    robots_config    TABLE     �  CREATE TABLE public.robots_config (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    rosbridge_server_ip character varying(15) NOT NULL,
    rosbridge_server_port character varying(5) NOT NULL,
    is_active character varying(15) NOT NULL,
    topics jsonb DEFAULT '{"scan": {"topic_name": "/scan_front", "message_type": "sensor_msgs/LaserScan"}, "cmd_vel": {"topic_name": "/cmd_vel", "message_type": "nav_msgs/Odometry"}, "nav_pos": {"topic_name": "/odom_encoder", "message_type": "nav_msgs/Odometry"}, "amcl_cov": {"topic_name": "/amcl_cov", "message_type": "geometry_msgs/Point"}, "slam_pos": {"topic_name": "/odom", "message_type": "nav_msgs/Odometry"}, "nav_speed": {"topic_name": "/odom", "message_type": "nav_msgs/Odometry"}, "slam_speed": {"topic_name": "/odom", "message_type": "nav_msgs/Odometry"}, "nav_poseListener": {"topic_name": "/amcl_pose", "message_type": "geometry_msgs/PoseWithCovarianceStamped"}, "slam_poseListener": {"topic_name": "/odom", "message_type": "nav_msgs/Odometry"}}'::jsonb,
    mode character varying(20) DEFAULT 'idle'::character varying NOT NULL,
    last_modified_timestamp timestamp without time zone
);
 !   DROP TABLE public.robots_config;
       public         heap    postgres    false            �            1259    16469    robots_config_id_seq    SEQUENCE     �   CREATE SEQUENCE public.robots_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.robots_config_id_seq;
       public          postgres    false    222            �           0    0    robots_config_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.robots_config_id_seq OWNED BY public.robots_config.id;
          public          postgres    false    221            +           2604    16473    robots_config id    DEFAULT     t   ALTER TABLE ONLY public.robots_config ALTER COLUMN id SET DEFAULT nextval('public.robots_config_id_seq'::regclass);
 ?   ALTER TABLE public.robots_config ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    221    222            �          0    16470    robots_config 
   TABLE DATA           �   COPY public.robots_config (id, name, rosbridge_server_ip, rosbridge_server_port, is_active, topics, mode, last_modified_timestamp) FROM stdin;
    public          postgres    false    222   �       �           0    0    robots_config_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.robots_config_id_seq', 132, true);
          public          postgres    false    221            /           2606    16475     robots_config robots_config_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.robots_config
    ADD CONSTRAINT robots_config_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.robots_config DROP CONSTRAINT robots_config_pkey;
       public            postgres    false    222            1           2606    32921    robots_config unique_name 
   CONSTRAINT     T   ALTER TABLE ONLY public.robots_config
    ADD CONSTRAINT unique_name UNIQUE (name);
 C   ALTER TABLE ONLY public.robots_config DROP CONSTRAINT unique_name;
       public            postgres    false    222            �   �  x��Kk�@���W��k�Ģ7����B��u3j ��5 �����!�Zc�g'�������Ki�m:ޣ���EZ����d+u���f!mo$Dn���7$OB�c�@�5,�3�K"�-�ӈ�1����ZG|I"����� k�r���$�L��5͹�!�ʬ)P�kb��2V��y���(pQ���TG��3��`�ф�:Wy���<�#}����PB�i�0��"�,�� �U4���<�C!A]��'�39�Pn�xFҐ�撰Duz<͓�.���������׵�.�u�<`�͞����T�9�}���L�o�k�k廹|^%�w��<��o��0"��<�^
�*��f�ë���v��5���[I1偺[ͩy9�wE���}���o���������)���b��b��nwh�C�z��av:�O�9̘     